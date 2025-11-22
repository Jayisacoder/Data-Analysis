import "./globals.css";
import "../styles/FileUpload.css";
import "../styles/DataPreview.css";
import "../styles/QualityScore.css";
import "../styles/DataVisualizations.css";
import "../styles/ColumnDetails.css";
import "../styles/AnalysisPage.css";
import "../styles/Wireframe.css";
import NavBar from "../components/NavBar";
import { DataProvider } from "../lib/DataContext";

export const metadata = {
  title: "Agentic Data Quality Platform",
  description: "AI-powered data quality insights and reporting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <header className="site-header">
            <div className="site-header-inner">
              <div className="brand-block">
                <strong className="brand">Agentic Data Quality Platform</strong>
                <div className="tagline">Upload data • Measure quality • AI remediation</div>
              </div>
              <NavBar />
            </div>
          </header>
          <main className="page-wrapper">
            {children}
          </main>
          <footer className="site-footer">
            <p>Educational project — MIT License</p>
          </footer>
        </DataProvider>
      </body>
    </html>
  );
}
