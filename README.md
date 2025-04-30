# PDF to JPG Converter

A web-based application that allows users to convert PDF files to various image formats (JPG, PNG, WEBP) with advanced image editing capabilities.

## Features

- **Drag & Drop Interface**: Easy file upload with drag and drop functionality
- **Multiple Format Support**: Convert to JPG, PNG, or WEBP formats
- **Image Quality Control**: Choose between High, Medium, and Low quality settings
- **Page Navigation**: Browse through multiple PDF pages
- **Image Editing Tools**:
  - Brightness adjustment
  - Contrast control
  - Rotation options (0°, 90°, 180°, 270°)
  - Watermark text overlay

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for PDF.js library)

### Installation

1. Clone this repository or download the files
2. No additional installation required - it's a client-side application

### Usage

1. Open `index.html` in your web browser
2. Drag and drop a PDF file into the upload area or click "Browse Files"
3. Use the preview controls to navigate through PDF pages
4. Adjust image settings as needed:
   - Select output format (JPG/PNG/WEBP)
   - Choose quality level
   - Adjust brightness and contrast
   - Set rotation angle
   - Add watermark text if desired
5. Click "Convert Image" to process and download the converted file

## Technical Details

The application uses:
- PDF.js for PDF rendering
- HTML5 Canvas API for image processing
- Native JavaScript for file handling and UI interactions

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- PDF.js library by Mozilla
- Icons and assets from open-source libraries