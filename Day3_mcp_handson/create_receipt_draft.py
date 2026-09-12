from mcp.server.mcpserver import MCPServer

mcp = MCPServer("create_receipt_draft")

BOOKINGS = {
    "BK-1001": {
        "customer": "Maya Rao",
        "route": "DEL-LIS",
        "fare": "economy",
        "status": "confirmed",
        "amount_inr": 72000,
        "departure": "2026-07-20",
        "baggage": "1 cabin bag + 1 checked bag up to 23 kg",
    },
    "BK-1002": {
        "customer": "Arjun Mehta",
        "route": "DEL-LIS",
        "fare": "economy",
        "status": "cancelled_by_airline",
        "amount_inr": 86000,
        "departure": "2026-07-21",
        "baggage": "1 cabin bag + 1 checked bag up to 23 kg",
    },
}


@mcp.tool()
def create_receipt_draft(booking_id: str, refund_amount_inr: int | None = None) -> dict:
    """
    Create a receipt email draft for one booking. Does not send email.
    Use only after get_booking confirms the booking exists.
    """
    booking = BOOKINGS.get(booking_id)
    if not booking:
        return {"ok": False, "error_type": "BOOKING_NOT_FOUND", "booking_id": booking_id}
    return {
        "ok": True,
        "to_customer": booking["customer"],
        "subject": f"Receipt draft for booking {booking_id}",
        "body": f"Dear {booking['customer']}, this is a draft receipt for booking {booking_id}. Refund estimate: {refund_amount_inr}.",
        "sent": False,
    }


if __name__ == "__main__":
    mcp.run()
