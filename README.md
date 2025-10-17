# Dynamic Data Visualizer

A React TypeScript application for interactive data visualization with scatter plots, regression curves, and advanced filtering capabilities.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.4.4-blue)
![Recharts](https://img.shields.io/badge/Recharts-3.3.0-green)

## Features

### � **Multiple Chart Types**
- **Scatter Plots**: Visualize individual data points with customizable axes
- **Regression Curves**: Display quadratic regression lines for trend analysis
- **Time-based Faceting**: Automatically create separate charts for each time point

### � **Advanced Data Handling**
- **CSV Upload**: Drag-and-drop CSV file upload with automatic parsing
- **Smart Column Detection**: Automatically identifies numerical and categorical columns
- **Data Filtering**: Filter by species, sex, and time points
- **Real-time Updates**: All visualizations update instantly when filters change

### � **Customizable Visualizations**
- **Axis Configuration**: Choose any numerical column for X and Y axes
- **Sex Differentiation**: Option to differentiate data by sex with unique shapes and line styles
- **Global Domain Control**: Consistent axis ranges across all charts
- **Interactive Tooltips**: Detailed hover information with formatted values
- **Expandable Charts**: Click to expand any chart to full-screen modal view

## Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dynamic-data-visualizer.git
   cd dynamic-data-visualizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Usage

### 1. Upload Your Data
- Click "Upload CSV File" to select your data file
- Supported format: CSV with headers
- Required columns: `Time_days`, `Species`, `Sex`
- Optional numerical columns for plotting

### 2. Configure Your Charts
- **Chart Type**: Choose between Scatter Plot or Regression Curves
- **X-Axis**: Select any numerical column
- **Y-Axis**: Select any numerical column
- **Differentiate by Sex**: Toggle to show sex-based groupings

### 3. Filter Your Data
- **Species**: Multi-select filter for species
- **Sex**: Multi-select filter for sex
- **Time Points**: Checkbox selection for specific time points

### 4. Interact with Visualizations
- **Hover**: See detailed point information in tooltips
- **Expand**: Click the "Expand ↗" button for full-screen charts
- **Scroll**: Horizontal scrolling for multiple time point charts

## Data Format

Your CSV file should follow this structure:

| Column | Type | Description | Required |
|--------|------|-------------|----------|
| `Report_id` | String | Unique report identifier | Yes |
| `Time_days` | Number | Time point in days | Yes |
| `Species` | String | Animal species | Yes |
| `Sex` | String | Animal sex | Yes |
| `Dietary_conc_ppm` | Number | Dietary concentration | No |
| `Dose_mg_kg` | Number | Dose in mg/kg | No |
| `Mean_Cmax_ng_ml` | Number | Mean Cmax measurement | No |
| `Reduced_bw` | Number | Reduced body weight (%) | No |
| `Hunched_posture` | Number | Hunched posture (%) | No |
| ...and other numerical columns | | | |

**Example CSV:**
```csv
Report_id,Time_days,Species,Sex,Dose_mg_kg,Mean_Cmax_ng_ml,Reduced_bw
RPT-001,7,Rat,Male,10,45.2,0.15
RPT-001,14,Rat,Male,10,42.1,0.23
RPT-002,7,Rat,Female,10,52.3,0.12
```

## Project Structure

```
src/
├── components/
│   ├── charts/           # Chart rendering components
│   │   ├── ChartContainer.tsx
│   │   ├── CustomTooltip.tsx
│   │   └── RenderSingleChart.tsx
│   ├── controls/         # UI control components
│   │   ├── ChartConfigControls.tsx
│   │   ├── FileUploader.tsx
│   │   └── FilterControls.tsx
│   └── layout/           # Layout components
│       └── Modal.tsx
├── hooks/               # Custom React hooks
│   ├── useChartData.ts
│   ├── useChartDomains.ts
│   └── useFileHandling.ts
├── interfaces/          # TypeScript interfaces
│   └── index.ts
├── utils/               # Utility functions
│   ├── chartUtils.ts
│   ├── constants.ts
│   ├── dataUtils.ts
│   └── mathUtils.ts
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── styles.css          # Global styles
```

## Technologies Used

- **React 18** - UI framework with TypeScript
- **Recharts** - Charting library for React
- **PapaParse** - CSV parsing library
- **TypeScript** - Type safety and developer experience

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Mathematical Methods

### Quadratic Regression
The application uses matrix-based quadratic regression calculation:
```typescript
f(x) = ax² + bx + c
```
Where coefficients are calculated using the least squares method with 3x3 matrix determinants.

### Percentage Handling
Columns identified as percentages are automatically:
- Scaled from 0-1 to 0-100% for display
- Formatted with percentage symbols in tooltips and axes
- Constrained to [0,1] domain for consistent visualization

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- CSV parsing by [PapaParse](https://www.papaparse.com/)
- Icons from [Heroicons](https://heroicons.com/)

## Support

For support and questions:
- Open an issue on GitHub
- Check the [documentation](docs/)
- Review existing [issues](issues/)

---

**Note**: This application is designed for scientific and research data visualization. Ensure proper data validation and quality control when using for critical analysis.
