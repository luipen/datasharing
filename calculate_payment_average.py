"""Calculate the average of all payments in an Excel file."""
import sys
import pandas as pd


def calculate_payment_average(filepath: str, amount_column: str = "Amount") -> float:
    """
    Read an Excel file and return the average of the payment column.

    Args:
        filepath: Path to the Excel file.
        amount_column: Name of the column containing payment amounts.

    Returns:
        The average payment value.
    """
    df = pd.read_excel(filepath)

    if amount_column not in df.columns:
        raise ValueError(
            f"Column '{amount_column}' not found. "
            f"Available columns: {list(df.columns)}"
        )

    payments = pd.to_numeric(df[amount_column], errors="coerce").dropna()

    if payments.empty:
        raise ValueError("No numeric payment values found in the column.")

    average = payments.mean()
    total = payments.sum()
    count = len(payments)

    print(f"File        : {filepath}")
    print(f"Column      : {amount_column}")
    print(f"Payments    : {count}")
    print(f"Total       : ${total:,.2f}")
    print(f"Average     : ${average:,.2f}")

    return average


if __name__ == "__main__":
    file = sys.argv[1] if len(sys.argv) > 1 else "payments.xlsx"
    col  = sys.argv[2] if len(sys.argv) > 2 else "Amount"
    calculate_payment_average(file, col)
