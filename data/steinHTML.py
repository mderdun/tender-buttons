import csv
import re

# Open the CSV file
with open('list.csv', 'r') as csv_file:
    csv_reader = csv.reader(csv_file)
    next(csv_reader)  # Skip the header row

    # Open the output file
    with open('output.html', 'w') as html_file:
        current_category = None
        for i, row in enumerate(csv_reader):
            # Extract the required values
            category = row[0]
            title = row[1]
            portrait = row[2]

            # If the category changes, close the previous category div and open a new one
            if category != current_category:
                if current_category is not None:
                    html_file.write('</div>\n')  # Close the previous category div
                html_file.write(f'<div id="{category}" class="cat">\n<h2>{category}</h2>\n')  # Open a new category div
                current_category = category

            # Generate the required HTML structure for the portrait
            portrait_html = ""
            for paragraph in re.split('\n\n+', portrait):  # Split the portrait text at each occurrence of two or more consecutive newline characters
                if re.search('[a-zA-Z]', paragraph):  # Check if the paragraph contains at least some alphabetical text
                    portrait_html += f'<p>{paragraph}</p>\n'

            html_structure = f"""
    <div id="{i+1}" class="portrait">
        <h3>{title}</h3>
        {portrait_html}
    </div>
"""
            # Write the HTML structure to the output file
            html_file.write(html_structure)

        if current_category is not None:
            html_file.write('</div>\n')  # Close the last category div

print("HTML file generated successfully.")