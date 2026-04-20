// components/auth/AuthLayout.jsx

const AuthLayout = ({ children, backgroundImage = "/images/login-bg.jpg" }) => {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 relative overflow-hidden"
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Yellow gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/70 via-yellow-600/70 to-yellow-700/70" />

      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Page content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;