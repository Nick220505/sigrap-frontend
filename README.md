# SIGRAP Frontend - Sistema de Gestión de Papelería

<p align="center">
  <img src="public/logo.png" alt="SIGRAP Logo" width="200">
</p>

[![Angular](https://img.shields.io/badge/Angular-19.2.8-red)](https://angular.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18.0.0-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 📝 Description

SIGRAP Frontend is an enterprise-grade application that provides a modern and intuitive interface for managing stationery store operations. Built with the latest Angular framework, it offers a robust solution for businesses looking to digitize and optimize their processes.

## 🚀 Key Features

- 📊 **Dashboard**: Real-time visualization of business metrics and KPIs
- 👥 **Customer Management**: Complete CRM functionality
- 📦 **Inventory Control**: Advanced inventory tracking and management
- 🏪 **Sales Operations**: Streamlined sales process and order management
- 👤 **Employee Management**: HR tools and employee data management
- 🤝 **Supplier Portal**: Supplier relationship and procurement management
- 📈 **Reporting & Analytics**: Comprehensive business reporting
- 🔍 **Audit System**: Detailed activity tracking and compliance
- 🔐 **User Management**: Role-based access control and user administration

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (Latest version)
- Angular CLI v19.2.8

### Installation

1. Clone the repository:
```bash
    git clone https://github.com/Nick220505/sigrap-frontend.git
cd sigrap-frontend
```

2. Install dependencies:
```bash
npm install
```

The application will be available at `http://localhost:4200/`. The development server includes hot-reload functionality for an optimized development experience.

## 📁 Project Structure

```
src/
├── app/
│   ├── core/           # Core functionality
│   │   ├── auth/       # Authentication & authorization
│   │   └── layout/     # Main layout components
│   ├── features/       # Feature modules
│   │   ├── configuration/
│   │   ├── customer/
│   │   ├── dashboard/
│   │   ├── employee/
│   │   ├── inventory/
│   │   ├── reports/
│   │   ├── sales/
│   │   └── supplier/
│   └── shared/         # Shared components and utilities
```

## 🛠️ Development Tools

### Code Generation

Angular CLI provides powerful code generation tools. Common commands:

```bash
# Generate a new component
ng generate component features/my-feature

# Generate a new service
ng generate service features/my-feature/services/my-service

# Generate a new store
ng generate service features/my-feature/stores/my-store
```

## 📜 Available Scripts

- `npm start`: Launch development server
- `npm run build`: Create production build
- `npm test`: Execute unit tests
- `npm run lint`: Run code linting

### Building for Production

```bash
npm run build
```

Build artifacts will be stored in the `dist/` directory, optimized for performance and production deployment.

## 🐳 Docker Support

The project includes Docker support for containerized deployment:

```bash
# Build Docker image
docker build -t sigrap-frontend .

# Run container
docker run -p 80:80 sigrap-frontend
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

The project uses Karma as the test runner for unit tests. Test files are located alongside the components they test with the `.spec.ts` extension.

## 🔒 Security

- JWT-based authentication
- Role-based access control
- Secure HTTP interceptors
- Protected routes with guards

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
