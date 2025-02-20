# Bill Splitting App Requirements Document

## 1. Overview

This document outlines the requirements, workflow, pipeline, and design architecture for a mobile app that splits the bill when a receipt is uploaded. The app leverages AI/LLM-based processing for receipt analysis and utilizes React Native for the front end, an Express backend, and separate AI modules communicating over gRPC.

---

## 2. Functional Requirements

### 2.1 User Authentication and Management

- **User Registration & Login**
  - Users can sign up and log in using standard authentication methods.
  - Support for social logins if required.
- **Profile Management**
  - Basic user profile operations (view, update, and delete profiles).

### 2.2 Receipt Upload and Processing

- **Receipt/Invoice Upload**
  - Users can upload images of receipts or invoices.
- **Document Classification**
  - AI module classifies the document as a receipt, invoice, or irrelevant document.
- **OCR Processing**
  - If the document is a receipt/invoice, perform OCR to extract text.
- **Data Extraction**
  - Use a pre-trained LLM to convert the OCR output into structured JSON data (e.g., items, totals, dates, taxes).
- **User Verification**
  - Present the extracted JSON data to the user for confirmation and correction.
- **Feedback Loop**
  - Record user corrections for periodic AI fine-tuning (e.g., on a weekly basis).

### 2.3 Bill Splitting and Group Management

- **Bill Splitting**
  - Users can split the confirmed bill data among friends.
  - Options for equal splits, percentage-based splits, or custom amounts.
- **Group/Trip Creation**
  - Users can create groups or trips to manage multiple bills collectively.
- **History and Tracking**
  - Maintain a history of processed bills and splits for future reference.

---

## 3. Non-Functional Requirements

### 3.1 Performance & Scalability

- **Low Latency**
  - Fast image uploads, OCR processing, and real-time data presentation.
- **Scalable Architecture**
  - The backend and AI modules should efficiently handle increasing usage.
- **Optimized Communication**
  - Use gRPC for efficient service-to-service communication.

### 3.2 Security

- **Data Protection**
  - Secure storage and transmission (HTTPS for mobile-backend communication; TLS for gRPC).
  - Encryption for sensitive data such as user details and receipt images.
- **Access Control**
  - Robust authentication and authorization mechanisms.

### 3.3 Reliability & Maintainability

- **Modular Design**
  - Clear separation of concerns among the mobile app, backend, and AI services.
- **Error Handling and Logging**
  - Comprehensive error handling and centralized logging for tracking performance and issues.
- **Documentation**
  - Detailed API documentation and versioning for maintainability.

### 3.4 Interoperability

- **API Contracts**
  - Clearly defined RESTful APIs for mobile-backend communication.
  - gRPC interfaces for communication between the backend and AI modules.
- **Service Integration**
  - Ensure smooth integration with third-party OCR services or managed cloud solutions if used.

---

## 4. Workflow and Pipeline

### 4.1 User Flow

1. **Registration/Login**
   - User registers or logs in through the mobile app.
2. **Receipt Upload**
   - User uploads an image of a receipt or invoice.
3. **Document Classification**
   - The image is sent to an AI module to determine if it is a receipt, invoice, or irrelevant document.
4. **OCR Processing**
   - If classified as a receipt/invoice, the image undergoes OCR to extract text.
5. **Data Extraction**
   - The OCR output is forwarded to a pre-trained LLM module to convert text into structured JSON data.
6. **User Verification**
   - The extracted JSON is presented to the user for confirmation and corrections.
7. **Feedback Logging**
   - Corrections made by the user are logged and stored for AI fine-tuning.
8. **Bill Splitting**
   - The confirmed receipt data is stored, and users can proceed to split the bill among friends or groups.
9. **Periodic Model Retraining**
   - Aggregated feedback data is used for periodic AI model retraining.

### 4.2 Pipeline Diagram

```plaintext
[Mobile App] 
     │ 
     ▼
[Express Backend API] 
     │ 
     ▼
[AI Document Classifier (gRPC)]
     │
     ├── If Receipt/Invoice ──► [OCR Module] ──► Extracted Text
     │
     ▼
[LLM Data Extraction Service (gRPC)]
     │ 
     ▼
[JSON Data Returned to Backend]
     │ 
     ▼
[User Verification on Mobile App]
     │ 
     ▼
[Data Storage & Feedback Logging]
     │ 
     ▼
[Periodic AI Model Retraining Pipeline]

## 5. Design Architecture

### 5.1 Frontend (React Native)
- **UI Components**
  - Receipt upload screen.
  - Data verification and correction interface.
  - Group/trip management and bill splitting interfaces.
- **State Management**
  - Use Redux or Context API for managing application state.
- **API Communication**
  - RESTful API calls to the Express backend.
  - Real-time updates and notifications regarding processing status.

### 5.2 Backend (Express.js)
- **API Endpoints**
  - User authentication and profile management.
  - Receipt upload and processing endpoints.
  - Bill splitting and group management endpoints.
- **Service Communication**
  - RESTful APIs for mobile client communication.
  - gRPC clients for communication with AI modules.
- **Middleware**
  - Authentication, logging, error handling, and input validation.

### 5.3 AI Modules
- **Document Classification Service**
  - Identifies if the document is a receipt, invoice, or irrelevant.
- **OCR Service**
  - Extracts text from receipt/invoice images.
  - Can be developed in-house or integrated with third-party OCR solutions.
- **LLM Data Extraction Service**
  - Processes OCR output and converts it into structured JSON.
- **Feedback & Retraining Service**
  - Collects user corrections and aggregates them for periodic model retraining.
- **Communication**
  - All AI services communicate with the backend using secure gRPC interfaces.

### 5.4 Data Layer
- **Database**
  - **PostgreSQL** for structured data (users, receipts, bills, groups).
- **Object/Blob Storage**
  - **AWS S3** for storing receipt images.
- **Backup & Security**
  - Regular backups.
  - Encryption and access control to ensure data privacy.
