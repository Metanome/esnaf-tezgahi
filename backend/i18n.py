"""Minimal backend i18n for agent action strings."""

_STRINGS: dict[str, dict[str, str]] = {
    "auto_created_product": {
        "en": "[info] Auto-created missing product: '{name}'",
        "tr": "[info] Eksik ürün otomatik oluşturuldu: '{name}'",
    },
    "alert_synced": {
        "en": "[alert] Alert synced for {name}",
        "tr": "[alert] {name} için uyarı senkronize edildi",
    },
    "order_created_customer": {
        "en": "[ok] Order created for customer: {customer}",
        "tr": "[ok] Sipariş oluşturuldu, müşteri: {customer}",
    },
    "transcribed": {
        "en": '[mic] Transcribed: "{text}"',
        "tr": '[mic] Transkript: "{text}"',
    },
    "order_created_voice": {
        "en": "[ok] Order created: {qty}× {name} for {customer}",
        "tr": "[ok] Sipariş oluşturuldu: {customer} için {qty}× {name}",
    },
    "stock_updated": {
        "en": "[ok] Stock updated: +{qty} {name}",
        "tr": "[ok] Stok güncellendi: +{qty} {name}",
    },
    "product_not_found": {
        "en": "[warn] Product '{name}' not found",
        "tr": "[warn] Ürün bulunamadı: '{name}'",
    },
    "stock_query_result": {
        "en": "[info] {name}: {qty} units in stock ({status})",
        "tr": "[info] {name}: stokta {qty} birim ({status})",
    },
}


def t(key: str, lang: str = "en", **kwargs: object) -> str:
    """Return a translated action string, falling back to English."""
    lang = lang if lang in ("en", "tr") else "en"
    template = _STRINGS[key].get(lang) or _STRINGS[key]["en"]
    return template.format(**kwargs) if kwargs else template
