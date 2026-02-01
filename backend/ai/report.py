from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_pdf_report(data):
    file_path = "ai_report.pdf"
    c = canvas.Canvas(file_path, pagesize=letter)

    c.setFont("Helvetica", 14)
    c.drawString(50, 750, "AutoSense Analytics - AI Report")

    c.setFont("Helvetica", 10)
    c.drawString(50, 720, f"Summary: {data['summary']}")

    c.save()
    return file_path
