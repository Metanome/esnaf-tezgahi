import logging
import sqlite3
from database import get_connection
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

    # Prepare alert details
    alert_type = "critical_stock" if product.status == "critical" else "low_stock"
    message = f"{product.name} is {product.status} stock ({product.stock_quantity} units)."
    
    draft_email = None
    if product.status == "critical":
        # Only draft if a supplier exists
        if product.supplier_name and product.supplier_email:
            draft_email = draft_reorder_email(
                product.supplier_name,
                product.supplier_email,
                [{"name": product.name, "sku": product.sku, "stock_quantity": product.stock_quantity}]
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
