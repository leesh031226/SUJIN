#!/usr/bin/env python3
import json
import re
import ssl
import sys
from html.parser import HTMLParser
from urllib.error import URLError
from urllib.request import Request, urlopen


PAGE_URL = "https://www.asahi.co.jp/ohaasa/week/horoscope/"
DATA_URL = "https://www.asahi.co.jp/data/ohaasa2020/horoscope.json"

TARGET_SIGN = {
    "en": "libra",
    "ko": "천칭자리",
    "ja": "てんびん座",
    "code": "07",
}

SIGN_MAP = {
    "01": {"ja": "おひつじ座", "en": "aries"},
    "02": {"ja": "おうし座", "en": "taurus"},
    "03": {"ja": "ふたご座", "en": "gemini"},
    "04": {"ja": "かに座", "en": "cancer"},
    "05": {"ja": "しし座", "en": "leo"},
    "06": {"ja": "おとめ座", "en": "virgo"},
    "07": {"ja": "てんびん座", "en": "libra"},
    "08": {"ja": "さそり座", "en": "scorpio"},
    "09": {"ja": "いて座", "en": "sagittarius"},
    "10": {"ja": "やぎ座", "en": "capricorn"},
    "11": {"ja": "みずがめ座", "en": "aquarius"},
    "12": {"ja": "うお座", "en": "pisces"},
}


class ClassFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.classes = set()
        self.scripts = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        class_attr = attrs.get("class", "")
        for class_name in class_attr.split():
            self.classes.add(class_name)
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])


def fetch_text(url, label):
    headers = {
        "User-Agent": "Mozilla/5.0 (compatible; SUJIN-Ohaasa-Test/1.0)",
        "Accept": "text/html,application/json,*/*",
    }
    request = Request(url, headers=headers)

    try:
        with urlopen(request, timeout=20) as response:
            return response, response.read().decode("utf-8-sig", "replace"), "default SSL"
    except URLError as error:
        if "CERTIFICATE_VERIFY_FAILED" not in str(error):
            raise
        print(f"{label}: default SSL failed: {error}")
        print(f"{label}: retrying with unverified SSL context for this fetch test")

    context = ssl._create_unverified_context()
    with urlopen(request, timeout=20, context=context) as response:
        return response, response.read().decode("utf-8-sig", "replace"), "unverified SSL retry"


def split_horoscope_text(text):
    parts = [part.strip() for part in text.split("\t") if part.strip()]
    lucky = parts[-1] if parts else ""
    fortune = " ".join(parts[:-1]) if len(parts) > 1 else text.strip()
    return fortune, lucky


def main():
    page_response, page_html, page_fetch_mode = fetch_text(PAGE_URL, "page")
    parser = ClassFinder()
    parser.feed(page_html)

    data_response, data_text, data_fetch_mode = fetch_text(DATA_URL, "data")
    data = json.loads(data_text)
    latest = data[0] if data else {}
    details = latest.get("detail", [])
    sorted_details = sorted(details, key=lambda item: int(item["ranking_no"]))

    enriched = []
    for item in sorted_details:
        sign = SIGN_MAP.get(item.get("horoscope_st"), {})
        fortune, lucky = split_horoscope_text(item.get("horoscope_text", ""))
        enriched.append(
            {
                "rank": int(item["ranking_no"]),
                "code": item.get("horoscope_st"),
                "ja": sign.get("ja", ""),
                "en": sign.get("en", ""),
                "fortune": fortune,
                "lucky": lucky,
                "raw_text": item.get("horoscope_text", ""),
            }
        )

    libra = next((item for item in enriched if item["code"] == TARGET_SIGN["code"]), None)

    html_has_containers = {
        ".oa_horoscope_date": "oa_horoscope_date" in parser.classes,
        ".oa_horoscope_list": "oa_horoscope_list" in parser.classes,
        "page_type=horoscope": bool(re.search(r'name="page_type"\s+value="horoscope"', page_html)),
    }

    print("ABC TV Ohaasa horoscope fetch test")
    print("=" * 40)
    print(f"Official page URL: {PAGE_URL}")
    print(f"Official data URL: {DATA_URL}")
    print(f"Saved sourceUrl: {PAGE_URL}")
    print(f"Page HTTP: {page_response.status} ({page_fetch_mode})")
    print(f"Data HTTP: {data_response.status} ({data_fetch_mode})")
    print(f"Content-Type page: {page_response.headers.get('content-type')}")
    print(f"Content-Type data: {data_response.headers.get('content-type')}")
    print(f"Onair date: {latest.get('onair_date')}")
    print(f"Found zodiac count: {len(enriched)}")
    print(f"Libra exists: {libra is not None}")
    if libra:
        print(f"Libra rank: {libra['rank']}")
        print(f"Libra Japanese name: {libra['ja']}")
        print(f"Libra Korean name: {TARGET_SIGN['ko']}")
        print(f"Libra fortune: {libra['fortune']}")
        print(f"Libra lucky item/color: {libra['lucky']}")
        print(f"Libra raw text: {libra['raw_text']}")
    print("HTML containers/selectors:")
    for selector, exists in html_has_containers.items():
        print(f"  {selector}: {exists}")
    print("Parsing structure:")
    print("  HTML page contains empty .oa_horoscope_date and .oa_horoscope_list containers.")
    print("  Official JS fetches /data/ohaasa2020/horoscope.json for page_type=horoscope.")
    print("  JSON path used: [0].detail[], sorted by ranking_no.")
    print("  Sign name mapping follows official JS Horoscope renderer value/label/en table.")
    print("All signs:")
    for item in enriched:
        print(f"  {item['rank']:>2}. {item['ja']} ({item['en']}) lucky={item['lucky']}")

    if len(enriched) != 12 or libra is None:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
