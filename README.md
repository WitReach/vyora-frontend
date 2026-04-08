# Vyora - Premium E-commerce Frontend

Vyora is a modern, high-performance, and feature-rich e-commerce frontend built with **Next.js 15**, **React 19**, and **Tailwind CSS 4**. It is designed to provide a premium shopping experience with smooth animations, responsive layouts, and a sleek user interface.

This project is open-source and ready for collaboration! Whether you want to contribute new features, improve the UI, or fix bugs, your contributions are welcome.

## 🚀 Key Features

- **Modern UI/UX**: Built with premium aesthetics and smooth micro-animations.
- **Responsive Design**: Optimized for mobile, tablet, and desktop.
- **Dynamic Shop & Products**: Categorized product listings and detailed product pages.
- **Cart & Checkout**: Full checkout flow with Razorpay integration.
- **User Authentication**: Secure login and registration.
- **State Management**: Powered by Zustand for optimal performance.
- **SEO Optimized**: Built with Next.js App Router for best-in-class performance and SEO.

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Slider**: [Swiper.js](https://swiperjs.com/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 🏗 Project Architecture

```
vyora-frontend/
├── app/            # Next.js App Router (pages & layouts)
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── lib/            # Utility functions and configurations
├── store/          # Zustand store for state management
├── types/          # TypeScript interface definitions
├── public/         # Static assets
```

## ⚙️ Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/WitReach/vyora-frontend.git
cd vyora-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file and add your environment variables:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔗 Related Repositories

This frontend communicates with the **Vyora API (Admin)** which handles the CMS, product management, and orders.

- **API/Admin Repo**: [https://github.com/WitReach/vyora-api](https://github.com/WitReach/vyora-api)

## 🤝 Contributing

We welcome contributions! If you'd like to help improve Vyora, please:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [Wit Reach](https://witreach.com) and [Dope Style](https://dopestyle.in)
