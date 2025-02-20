import re

# Step 1: Clean the OCR Output


def clean_text(raw_text):
    """
    Clean the raw OCR output by removing noise, normalizing whitespace, and fixing common errors.
    """
    # Remove unwanted symbols and noise
    # Remove specific symbols
    cleaned_text = re.sub(r'[|~\\;\[\]{}<>]', '', raw_text)
    # Remove single or double letters not digits
    cleaned_text = re.sub(r'\b([A-Za-z])\1\b', '', cleaned_text)
    # Trim leading/trailing spaces
    cleaned_text = re.sub(r'^\s+|\s+$', '', cleaned_text)

    # Fix common OCR errors
    cleaned_text = re.sub(r'AMOUNT', 'Amount:',
                          cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'Sub-total', 'Subtotal:',
                          cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'Sales Tax', 'Sales Tax:',
                          cleaned_text, flags=re.IGNORECASE)
    cleaned_text = re.sub(r'Balance', 'Balance:',
                          cleaned_text, flags=re.IGNORECASE)

    return cleaned_text

# Step 2: Parse Sections


def parse_sections(cleaned_text):
    """
    Parse the cleaned text into logical sections (e.g., header, items, totals).
    """
    sections = {
        "header": [],
        "items": [],
        "totals": []
    }
    print("clean", cleaned_text)
    lines = cleaned_text.split('\n')
    for line in lines:
        line = line.strip()

        # Header section
        if re.match(r'(Address|Tel|Date)', line, re.IGNORECASE):
            sections["header"].append(line)

        # Items section
        # Lines with item names and prices
        elif re.match(r'^[A-Za-z].*\d+(\.\d{2})?$', line):
            sections["items"].append(line)

        # Totals section
        elif re.match(r'(Subtotal|Sales Tax|Amount|Balance)', line, re.IGNORECASE):
            sections["totals"].append(line)

    return sections

# Step 3: Format Structured Output


def format_structured_output(sections):
    """
    Format the parsed sections into a clean, structured text.
    """
    structured_output = ""

    # Header
    structured_output += "Header:\n"
    structured_output += "\n".join(sections["header"]) + "\n\n"

    # Items
    structured_output += "Items:\n"
    for item in sections["items"]:
        structured_output += f"- {item}\n"
    structured_output += "\n"

    # Totals
    structured_output += "Totals:\n"
    structured_output += "\n".join(sections["totals"]) + "\n"

    return structured_output

# Main Pipeline


def process_receipt(raw_text):
    """
    Process the raw OCR output and generate a clean, structured text.
    """
    # Step 1: Clean the text
    cleaned_text = clean_text(raw_text)

    # Step 2: Parse sections
    sections = parse_sections(cleaned_text)

    # Step 3: Format structured output
    structured_output = format_structured_output(sections)

    return structured_output


# Example Usage
if __name__ == "__main__":
    raw_text = """
    |      Adress: 1234 Lorem Ipsum, Dolor      |   4
    Tel: 123-456-7890                      ~
    Date: 01-01-2018            10:35
    | Lorem                                6.50
    |     Ipsum                                7.50
    | Dolor Sit                          48.00 |
    1     Amet                                  9.30
    Consectetur                      11.90       ;
    Adipiscing Elit                  1.20       t
    | Sed Do                                0.40
    j                                                         1
    \                                                         q
    | AMOUNT                     84.80
    I                                                         I!
    |      Sub-total                        76.80       i
    |      Sales Tax                          8.00
    s                        Balance                           84 .80       i
    3              |            I              [                |
    Fy               i            ii             il               |
    =<.
    """
    structured_output = process_receipt(raw_text)
    print(structured_output)
