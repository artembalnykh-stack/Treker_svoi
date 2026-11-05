"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: "1rem",
          background: "#FDFBF7",
          color: "#1F2937",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "30rem",
            border: "1px solid #E7DFD3",
            borderRadius: "1.1rem",
            background: "#FFFDF9",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>
            Приложение временно недоступно
          </h1>
          <p style={{ color: "#5B6675", lineHeight: 1.55 }}>
            Не удалось загрузить демо. Обновите страницу — база данных может
            просыпаться после паузы.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: "3rem",
              border: 0,
              borderRadius: "0.9rem",
              background: "#A94A2E",
              color: "#FFFDF9",
              fontWeight: 700,
              padding: "0.6rem 1.2rem",
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
          {error.digest && (
            <p style={{ fontSize: "0.7rem", color: "#5B6675" }}>
              Код ошибки: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
