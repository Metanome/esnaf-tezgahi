import logging
import sqlite3
from database import get_connection
from i18n import t as _t
from repositories.product_repository import ProductRepository
from repositories.alert_repository import AlertRepository
from schemas.alert import AlertCreate
from services.email_service import draft_reorder_email

def sync_alert(conn: sqlite3.Connection, product_id: int):
    """
    Synchronize the alert state for a specific product.
    Resolves alerts if status is 'ok', updates if stale, or creates if missing.
    """
    repo = ProductRepository(conn)
    alert_repo = AlertRepository(conn)
    product = repo.get_by_id(product_id)
    if not product:
        return

    # Check for an active (unresolved) alert
    existing_row = conn.execute(
        "SELECT id FROM alerts WHERE product_id = ? AND resolved = 0",
        (product.id,)
    ).fetchone()

    if product.status == "ok":
        if existing_row:
            alert_repo.resolve(existing_row["id"])
        return

    profile_row = conn.execute("SELECT language_preference FROM profile WHERE id = 1").fetchone()
    lang = profile_row["language_preference"] if profile_row else "tr"

    alert_type = "critical_stock" if product.status == "critical" else "low_stock"
    status_label = _t(f"status_{product.status}", lang)
    message = _t("alert_stock_message", lang, name=product.name, status=status_label, qty=product.stock_quantity)

    draft_email = None
    if product.status == "critical":
        if product.supplier_name and product.supplier_email:
            draft_email = draft_reorder_email(
                product.supplier_name,
                product.supplier_email,
                [{"name": product.name, "sku": product.sku, "stock_quantity": product.stock_quantity}],
                lang=lang,
            )

    if existing_row:
        alert_repo.update(existing_row["id"], alert_type, message, draft_email)
    else:
        alert_repo.create(AlertCreate(
            type=alert_type,
            product_id=product.id,
            message=message,
            draft_email=draft_email
        ))

def check_and_alert_stock(product_id: int):
    """
    FastAPI BackgroundTask wrapper for sync_alert.
    """
    conn = get_connection()
    try:
        sync_alert(conn, product_id)
        conn.commit()
        from services.event_service import notify_clients
        notify_clients("update")
    except Exception as e:
        logging.error(f"Background alert sync failed for product {product_id}: {e}", exc_info=e)
    finally:
        conn.close()
