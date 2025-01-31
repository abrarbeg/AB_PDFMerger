# app.py (Final Version)
from flask import Flask, render_template, request, send_file, after_this_request
from PyPDF2 import PdfMerger
from io import BytesIO
import uuid

app = Flask(__name__)
app.config['OUTPUT_FOLDER'] = 'temp_output'

# Create output directory if not exists
import os
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge', methods=['POST'])
def merge():
    output_path = None
    merger = PdfMerger()
    
    try:
        # Process files directly from memory
        for pdf in request.files.getlist('pdfs'):
            if not pdf or pdf.filename == '':
                continue
            if not pdf.filename.lower().endswith('.pdf'):
                return 'All files must be PDFs', 400
            
            # Add PDF to merger directly from memory
            pdf_stream = BytesIO()
            pdf.save(pdf_stream)
            pdf_stream.seek(0)
            merger.append(pdf_stream)
            pdf_stream.close()

        # Create merged file in temporary output
        output_filename = f"merged_{uuid.uuid4().hex}.pdf"
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)

        # Setup cleanup for output file
        @after_this_request
        def remove_file(response):
            try:
                if output_path and os.path.exists(output_path):
                    os.remove(output_path)
            except Exception as e:
                app.logger.error(f"Error deleting output file: {str(e)}")
            return response

        return send_file(output_path, as_attachment=True, download_name='merged.pdf')

    except Exception as e:
        return f'Error: {str(e)}', 500
    finally:
        merger.close()

if __name__ == '__main__':
    app.run(debug=True)