import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import HashTool from "./pages/HashTool";
import IntegrityCheck from "./pages/IntegrityCheck";
import MalwareScan from "./pages/MalwareScan";
import UrlScanner from "./pages/UrlScanner";
import PasswordChecker from "./pages/PasswordChecker";
import UploadPage from "./pages/UploadPage";
import Download from "./pages/Download";
import PasswordGenerator from "./pages/PasswordGenerater";
import Base64Tool from "./pages/Base64Tool";
import IPTracker from "./pages/IPTracker";
import Whois from "./pages/Whois";
import ShodanScanner from "./pages/Shodan";
import PortScanner from "./pages/PortScanner";
import FileMetadataAnalyzer from "./pages/FileMetadataAnalyzer";
import SubdomainScanner from "./pages/SubdomainScanner";
import EncryptionTool from "./pages/EncryptionTool";
import HeaderAnalyzer from "./pages/HeaderAnalyzer";
import ScanHistoryDashboard from "./pages/ScanHistoryDashboard";
import JwtTool from "./pages/JwtTool";
import IOCExtractor from "./pages/IOCExtractor";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/hash" element={<HashTool />} />
          <Route path="/integrity" element={<IntegrityCheck />} />
          <Route path="/malware" element={<MalwareScan />} />
          <Route path="/url" element={<UrlScanner />} />
          <Route path="/password" element={<PasswordChecker />} />
          <Route path="/download/:id" element={<Download />} />
          <Route path="/password-gen" element={<PasswordGenerator />} />
          <Route path="/base64" element={<Base64Tool />} />
          <Route path="/ip" element={<IPTracker />} />
          <Route path="/whois" element={<Whois />} />
          <Route path="/port" element={<PortScanner />} />
          <Route path="/shodan" element={<ShodanScanner />} />
          <Route path="/metadata" element={<FileMetadataAnalyzer />} />
          <Route path="/subdomains" element={<SubdomainScanner />} />
          <Route path="/encrypt" element={<EncryptionTool />} />
          <Route path="/headers" element={<HeaderAnalyzer />} />
          <Route path="/history" element={<ScanHistoryDashboard />} />
          <Route path="/jwt" element={<JwtTool />} />
          <Route path="/ioc" element={<IOCExtractor />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
