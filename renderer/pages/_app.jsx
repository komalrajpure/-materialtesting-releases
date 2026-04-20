import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen no-drag">
      <Component {...pageProps} />
    </div>
  );
}