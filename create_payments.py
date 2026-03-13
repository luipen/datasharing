"""Script to create a sample payments Excel file."""
import openpyxl

wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Payments"

# Headers
ws.append(["ID", "Date", "Recipient", "Amount"])

# Sample payment data
payments = [
    (1, "2026-01-05", "Alice Johnson",  250.00),
    (2, "2026-01-12", "Bob Smith",      175.50),
    (3, "2026-01-20", "Carol White",    320.00),
    (4, "2026-02-03", "Dave Brown",      89.99),
    (5, "2026-02-14", "Eve Davis",      450.00),
    (6, "2026-02-22", "Frank Miller",   130.75),
    (7, "2026-03-01", "Grace Wilson",   200.00),
    (8, "2026-03-08", "Henry Moore",    550.25),
    (9, "2026-03-10", "Ivy Taylor",      75.00),
    (10, "2026-03-12", "Jack Anderson", 410.50),
]

for row in payments:
    ws.append(row)

wb.save("payments.xlsx")
print("payments.xlsx created successfully.")
