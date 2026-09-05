#!/usr/bin/env python3
import json
import os
import ssl
import sys
import tempfile
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from json import JSONDecodeError
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


SOURCE_PAGE_URL = "https://www.asahi.co.jp/ohaasa/week/horoscope/"
SOURCE_URL = "https://www.asahi.co.jp/data/ohaasa2020/horoscope.json"
DEEPL_TRANSLATE_URL = "https://api-free.deepl.com/v2/translate"
OUTPUT_DIR = Path("public/data/ohaasa")
LATEST_PATH = OUTPUT_DIR / "latest.json"
ARCHIVE_DIR = OUTPUT_DIR / "archive"

JST = timezone(timedelta(hours=9), "Asia/Tokyo")
KST = timezone(timedelta(hours=9), "Asia/Seoul")

PERSON = {
    "name": "수진",
    "birthday": "09-23",
    "zodiac": "libra",
    "zodiacKo": "천칭자리",
    "zodiacJa": "てんびん座",
    "horoscopeCode": "07",
}

SIGN_MAP = {
    "01": {"zodiac": "aries", "zodiacKo": "양자리", "zodiacJa": "おひつじ座"},
    "02": {"zodiac": "taurus", "zodiacKo": "황소자리", "zodiacJa": "おうし座"},
    "03": {"zodiac": "gemini", "zodiacKo": "쌍둥이자리", "zodiacJa": "ふたご座"},
    "04": {"zodiac": "cancer", "zodiacKo": "게자리", "zodiacJa": "かに座"},
    "05": {"zodiac": "leo", "zodiacKo": "사자자리", "zodiacJa": "しし座"},
    "06": {"zodiac": "virgo", "zodiacKo": "처녀자리", "zodiacJa": "おとめ座"},
    "07": {"zodiac": "libra", "zodiacKo": "천칭자리", "zodiacJa": "てんびん座"},
    "08": {"zodiac": "scorpio", "zodiacKo": "전갈자리", "zodiacJa": "さそり座"},
    "09": {"zodiac": "sagittarius", "zodiacKo": "사수자리", "zodiacJa": "いて座"},
    "10": {"zodiac": "capricorn", "zodiacKo": "염소자리", "zodiacJa": "やぎ座"},
    "11": {"zodiac": "aquarius", "zodiacKo": "물병자리", "zodiacJa": "みずがめ座"},
    "12": {"zodiac": "pisces", "zodiacKo": "물고기자리", "zodiacJa": "うお座"},
}


class OhaasaError(Exception):
    pass


class FetchError(OhaasaError):
    pass


class ResponseJsonError(OhaasaError):
    pass


class ValidationError(OhaasaError):
    pass


class TranslationError(OhaasaError):
    pass


def today_jst():
    return datetime.now(JST).strftime("%Y-%m-%d")


def today_kst():
    return datetime.now(KST).strftime("%Y-%m-%d")


def is_weekend_kst():
    return datetime.now(KST).weekday() >= 5


def is_valid_current_latest(path, expected_date, require_translations=False):
    try:
        with path.open(encoding="utf-8") as file:
            data = json.load(file)
    except (OSError, JSONDecodeError):
        return False

    if not is_valid_saved_record(data, expected_date):
        return False

    if not has_source_url(data):
        return False

    if require_translations and not has_required_translations(data):
        return False

    return True


def is_valid_saved_record(data, expected_date):
    if not isinstance(data, dict):
        return False
    if data.get("status") != "success":
        return False
    if data.get("date") != expected_date:
        return False

    person = data.get("person")
    if not isinstance(person, dict) or person.get("horoscopeCode") != PERSON["horoscopeCode"]:
        return False

    fortune = data.get("fortune")
    if not isinstance(fortune, dict):
        return False

    rank = fortune.get("rank")
    if not isinstance(rank, int) or rank < 1 or rank > 12:
        return False

    message_ja = fortune.get("messageJa")
    if not isinstance(message_ja, str) or not message_ja.strip():
        return False

    return True


def has_required_translations(data):
    fortune = data.get("fortune", {})
    if not isinstance(fortune.get("messageKo"), str) or not fortune["messageKo"].strip():
        return False

    lucky = fortune.get("lucky", {})
    if lucky.get("itemJa") and (not isinstance(lucky.get("itemKo"), str) or not lucky["itemKo"].strip()):
        return False

    all_signs = data.get("allSigns", [])
    if not isinstance(all_signs, list):
        return False

    for sign in all_signs:
        if not isinstance(sign.get("messageKo"), str) or not sign["messageKo"].strip():
            return False

        sign_lucky = sign.get("lucky", {})
        if sign_lucky.get("itemJa") and (not isinstance(sign_lucky.get("itemKo"), str) or not sign_lucky["itemKo"].strip()):
            return False

    return True


def has_source_url(data):
    source_url = data.get("sourceUrl")
    return isinstance(source_url, str) and source_url.startswith(("https://", "http://"))


def fetch_official_json():
    print("[OHAASA] fetching official JSON...", flush=True)
    request = Request(
        SOURCE_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; SUJIN-Ohaasa-Updater/1.0)",
            "Accept": "application/json,*/*",
        },
    )

    try:
        with urlopen(request, timeout=20) as response:
            return read_success_response(response, "default system CA")
    except HTTPError as error:
        raise FetchError(f"HTTP {error.code}") from error
    except URLError as error:
        if "CERTIFICATE_VERIFY_FAILED" not in str(error):
            raise FetchError(str(error)) from error

        print("[OHAASA] default SSL verification failed; retrying with certifi CA bundle...", flush=True)
        try:
            import certifi
        except ImportError as import_error:
            raise FetchError(
                "SSL certificate verification failed and certifi is not installed. "
                "Install/update certifi or run the Python macOS Install Certificates command."
            ) from import_error

        context = ssl.create_default_context(cafile=certifi.where())
        try:
            with urlopen(request, timeout=20, context=context) as response:
                return read_success_response(response, "certifi CA bundle")
        except HTTPError as http_error:
            raise FetchError(f"HTTP {http_error.code}") from http_error
        except URLError as certifi_error:
            raise FetchError(
                "SSL certificate verification failed even with certifi. "
                "Update certifi, check the local Python certificate store, or verify network inspection settings."
            ) from certifi_error


def read_success_response(response, ssl_mode):
    if response.status != 200:
        raise FetchError(f"HTTP {response.status}")

    content_type = response.headers.get("content-type", "")
    if "json" not in content_type.lower():
        raise FetchError(f"unexpected content-type: {content_type}")

    text = response.read().decode("utf-8-sig", "replace")
    try:
        return json.loads(text), ssl_mode
    except JSONDecodeError as error:
        raise ResponseJsonError("invalid JSON response") from error


def split_horoscope_text(raw_text):
    if not isinstance(raw_text, str):
        raise ValidationError("horoscope_text must be a string")

    parts = [part.strip() for part in raw_text.split("\t") if part.strip()]
    if not parts:
        return "", None

    if len(parts) == 1:
        return parts[0], None

    return " ".join(parts[:-1]), parts[-1]


def normalize_date(onair_date):
    if not isinstance(onair_date, str) or len(onair_date) != 8 or not onair_date.isdigit():
        raise ValidationError(f"invalid onair_date: {onair_date!r}")
    parsed = datetime.strptime(onair_date, "%Y%m%d")
    return parsed.strftime("%Y-%m-%d")


def parse_signs(payload):
    if not isinstance(payload, list) or not payload:
        raise ValidationError("official JSON root must be a non-empty list")

    latest = payload[0]
    if not isinstance(latest, dict):
        raise ValidationError("official JSON [0] must be an object")

    details = latest.get("detail")
    if not isinstance(details, list):
        raise ValidationError("official JSON [0].detail must be a list")

    signs = []
    for item in details:
        if not isinstance(item, dict):
            raise ValidationError("each detail entry must be an object")

        code = str(item.get("horoscope_st", "")).zfill(2)
        sign = SIGN_MAP.get(code)
        if sign is None:
            raise ValidationError(f"unknown horoscope_st code: {code!r}")

        try:
            rank = int(item.get("ranking_no"))
        except (TypeError, ValueError) as error:
            raise ValidationError(f"invalid ranking_no for horoscope_st {code}") from error

        message_ja, lucky_ja = split_horoscope_text(item.get("horoscope_text", ""))
        if lucky_ja is not None and not isinstance(lucky_ja, str):
            raise ValidationError(f"invalid lucky value for horoscope_st {code}")

        signs.append(
            {
                "rank": rank,
                "ranking_no": item.get("ranking_no"),
                "horoscopeCode": code,
                "horoscope_st": item.get("horoscope_st"),
                "zodiac": sign["zodiac"],
                "zodiacKo": sign["zodiacKo"],
                "zodiacJa": sign["zodiacJa"],
                "messageJa": message_ja,
                "messageKo": None,
                "lucky": {
                    "itemJa": lucky_ja,
                    "itemKo": None,
                },
                "sourceFields": {
                    "horoscope_detail_id": item.get("horoscope_detail_id"),
                    "horoscope_id": item.get("horoscope_id"),
                    "rawHoroscopeText": item.get("horoscope_text"),
                },
            }
        )

    signs.sort(key=lambda sign: sign["rank"])
    print(f"[OHAASA] parsed {len(signs)} signs", flush=True)
    return latest, signs


def validate_data(latest, signs):
    if len(signs) != 12:
        raise ValidationError(f"expected 12 signs, got {len(signs)}")

    ranks = [sign["rank"] for sign in signs]
    if sorted(ranks) != list(range(1, 13)):
        raise ValidationError("ranks are not exactly 1-12")
    if len(set(ranks)) != 12:
        raise ValidationError("ranking_no contains duplicates")

    codes = [sign["horoscopeCode"] for sign in signs]
    if len(set(codes)) != 12:
        raise ValidationError("horoscope_st contains duplicates")
    if PERSON["horoscopeCode"] not in codes:
        raise ValidationError("Libra code 07 missing")

    libra = next(sign for sign in signs if sign["horoscopeCode"] == PERSON["horoscopeCode"])
    if not libra["messageJa"]:
        raise ValidationError("Libra Japanese fortune message is empty")

    lucky = libra["lucky"]["itemJa"]
    if lucky is not None and (not isinstance(lucky, str) or not lucky.strip()):
        raise ValidationError("Libra lucky item exists but is not a valid string")

    if latest.get("onair_date") is None:
        raise ValidationError("onair_date is missing")

    print("[OHAASA] validation passed", flush=True)
    return libra


def translate_texts_ja_to_ko(texts):
    api_key = os.environ.get("DEEPL_API_KEY")
    unique_texts = []
    seen = set()

    for text in texts:
        if not isinstance(text, str) or not text.strip():
            continue

        normalized = text.strip()
        if normalized not in seen:
            seen.add(normalized)
            unique_texts.append(normalized)

    if not unique_texts:
        return {}

    if not api_key:
        print("[OHAASA] DEEPL_API_KEY is not set; keeping Japanese text without Korean translations", flush=True)
        return {}

    request_body = json.dumps(
        {
            "text": unique_texts,
            "source_lang": "JA",
            "target_lang": "KO",
        }
    ).encode("utf-8")

    request = Request(
        DEEPL_TRANSLATE_URL,
        data=request_body,
        headers={
            "Authorization": f"DeepL-Auth-Key {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=20) as response:
            if response.status != 200:
                raise TranslationError(f"DeepL HTTP {response.status}")

            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        raise TranslationError(f"DeepL HTTP {error.code}") from error
    except URLError as error:
        raise TranslationError(f"DeepL request failed: {error.reason}") from error
    except JSONDecodeError as error:
        raise TranslationError("DeepL returned invalid JSON") from error

    translations = payload.get("translations")
    if not isinstance(translations, list) or len(translations) != len(unique_texts):
        raise TranslationError("DeepL response shape did not match request")

    translated = {}
    for original, item in zip(unique_texts, translations):
        translated_text = item.get("text") if isinstance(item, dict) else None
        if isinstance(translated_text, str) and translated_text.strip():
            translated[original] = translated_text.strip()

    if len(translated) != len(unique_texts):
        raise TranslationError("DeepL returned an empty translation")

    print(f"[OHAASA] translated {len(translated)} unique Japanese texts with DeepL", flush=True)
    return translated


def apply_korean_translations(signs):
    texts = []
    for sign in signs:
        texts.append(sign.get("messageJa"))
        texts.append(sign.get("lucky", {}).get("itemJa"))

    try:
        translations = translate_texts_ja_to_ko(texts)
    except TranslationError as error:
        print(f"[OHAASA] translation failed: {error}; keeping Japanese text", file=sys.stderr, flush=True)
        return

    if not translations:
        return

    for sign in signs:
        message_ja = sign.get("messageJa")
        if isinstance(message_ja, str):
            sign["messageKo"] = translations.get(message_ja.strip()) or sign.get("messageKo")

        lucky = sign.get("lucky", {})
        lucky_ja = lucky.get("itemJa")
        if isinstance(lucky_ja, str):
            lucky["itemKo"] = translations.get(lucky_ja.strip()) or lucky.get("itemKo")


def build_output(latest, signs, libra, ssl_mode):
    date = normalize_date(latest.get("onair_date"))
    updated_at = datetime.now(JST).isoformat()

    return {
        "schemaVersion": 1,
        "date": date,
        "source": {
            "name": "ABC TV おはよう朝日です",
            "type": "official-json",
            "url": SOURCE_URL,
        },
        "sourceUrl": SOURCE_PAGE_URL,
        "status": "success",
        "updatedAt": updated_at,
        "fetch": {
            "ssl": ssl_mode,
            "onairDate": latest.get("onair_date"),
            "openStatus": latest.get("open_st"),
            "horoscopeId": latest.get("horoscope_id"),
        },
        "person": PERSON,
        "fortune": {
            "rank": libra["rank"],
            "messageJa": libra["messageJa"],
            "messageKo": libra["messageKo"],
            "lucky": {
                "itemJa": libra["lucky"]["itemJa"],
                "itemKo": libra["lucky"]["itemKo"],
            },
        },
        "allSigns": signs,
    }


def atomic_write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    json_text = json.dumps(data, ensure_ascii=False, indent=2)

    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        dir=str(path.parent),
        prefix=f".{path.name}.",
        suffix=".tmp",
        delete=False,
    ) as temp_file:
        temp_file.write(json_text)
        temp_file.write("\n")
        temp_path = Path(temp_file.name)

    try:
        with temp_path.open(encoding="utf-8") as check_file:
            json.load(check_file)
        os.replace(temp_path, path)
    except Exception:
        temp_path.unlink(missing_ok=True)
        raise


def save_archive_if_needed(archive_path, output):
    if archive_path.exists():
        archive_data = load_json_file(archive_path)
        if is_valid_saved_record(archive_data, output["date"]) and has_source_url(archive_data):
            print(f"[OHAASA] archive already exists: {output['date']}", flush=True)
            return
        print(f"[OHAASA] archive exists but is invalid, replacing: {output['date']}", flush=True)

    atomic_write_json(archive_path, output)
    print(f"[OHAASA] archive saved: {output['date']}", flush=True)


def load_json_file(path):
    try:
        with path.open(encoding="utf-8") as file:
            return json.load(file)
    except (OSError, JSONDecodeError):
        return None


def main():
    try:
        current_date = today_kst()
        if is_weekend_kst():
            print(
                "[OHAASA] Skip update: weekend horoscope data is not published on the official web endpoint",
                flush=True,
            )
            return 0

        require_translations = bool(os.environ.get("DEEPL_API_KEY"))
        if is_valid_current_latest(LATEST_PATH, current_date, require_translations):
            print("[OHAASA] today's valid data already exists, skipping", flush=True)
            return 0

        payload, ssl_mode = fetch_official_json()
        latest, signs = parse_signs(payload)
        official_date = normalize_date(latest.get("onair_date"))
        if official_date != current_date:
            print(
                f"[OHAASA] Skip update: official horoscope data is stale "
                f"(today: {current_date}, onair_date: {official_date})",
                flush=True,
            )
            return 0

        libra = validate_data(latest, signs)
        apply_korean_translations(signs)
        output = build_output(latest, deepcopy(signs), libra, ssl_mode)

        print(f"[OHAASA] Libra rank: {libra['rank']}", flush=True)
        atomic_write_json(LATEST_PATH, output)
        print("[OHAASA] latest.json updated", flush=True)

        archive_path = ARCHIVE_DIR / f"{output['date']}.json"
        save_archive_if_needed(archive_path, output)
        return 0
    except FetchError as error:
        print(f"[OHAASA] fetch failed: {error}", file=sys.stderr, flush=True)
        return 1
    except ResponseJsonError:
        print("[OHAASA] invalid JSON response", file=sys.stderr, flush=True)
        return 1
    except ValidationError as error:
        print(f"[OHAASA] validation failed: {error}", file=sys.stderr, flush=True)
        return 1
    except OhaasaError as error:
        print(f"[OHAASA] error: {error}", file=sys.stderr, flush=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())
