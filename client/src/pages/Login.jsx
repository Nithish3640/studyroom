import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Logo() {
  return (
    <div className="flex items-center gap-2.5 text-[#2b1237]">
      <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#f472b6] text-white shadow-[0_7px_18px_rgba(124,58,237,0.24)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h5v15H7a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
          <path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-5v15h5a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
        </svg>
      </div>
      <span className="text-[21px] font-bold tracking-[-0.04em]">StudyRoom</span>
    </div>
  );
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.8 10.8 0 0 1 12 4c5.4 0 9 6 9 6a17.8 17.8 0 0 1-3 3.7M6.2 6.2C4.1 7.6 3 10 3 10s3.6 6 9 6c.7 0 1.4-.1 2-.3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12s3.5-5.5 9-5.5 9 5.5 9 5.5-3.5 5.5-9 5.5S3 12 3 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

function SocialIcon({ provider }) {
  if (provider === "GitHub") {
    return (
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.87c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.6h3.3c1.9-1.8 2.9-4.4 2.9-7.5Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4L15.4 17c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.7A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.5 13.9A6 6 0 0 1 6.2 12c0-.7.1-1.3.3-1.9V7.4H3.1A10 10 0 0 0 2 12c0 1.7.4 3.2 1.1 4.6l3.4-2.7Z" />
      <path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.8 9.8 0 0 0 12 2a10 10 0 0 0-8.9 5.4l3.4 2.7A5.9 5.9 0 0 1 12 6Z" />
    </svg>
  );
}

function Field({ label, type = "text", placeholder, right, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#44374a]">{label}</span>
      <span className="relative block">
        <input
          type={type}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="h-[50px] w-full rounded-xl border border-[#e4dff0] bg-white px-4 pr-11 text-sm text-[#1a1023] outline-none transition placeholder:text-[#a49ba7] focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
        />
        {right}
      </span>
    </label>
  );
}

function TaskBoard() {
  const tasks = [
    { title: "Review chapter notes", tag: "To do", color: "bg-[#ede4ff] text-[#6d28d9]", avatar: "AM", avatarColor: "bg-[#f1c9aa]" },
    { title: "Solve practice quiz", tag: "Doing", color: "bg-[#ffe0ee] text-[#be185d]", avatar: "JK", avatarColor: "bg-[#d8c7ef]" },
    { title: "Share AI summary", tag: "Done", color: "bg-white text-[#695c6e] ring-1 ring-[#e6dee8]", avatar: "NO", avatarColor: "bg-[#f0b8bd]" },
  ];

  return (
    <div className="board-float relative mx-auto w-full max-w-[402px] rounded-[22px] border border-white/20 bg-white/90 p-5 text-[#24122e] shadow-[0_30px_70px_rgba(8,0,14,0.36)] backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#918796]">Biology 101</p>
          <h3 className="mt-1 font-bold tracking-[-0.02em]">Exam preparation</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[#f3e8ff] px-2.5 py-1 text-[11px] font-bold text-[#7c3aed]">
          <span className="size-1.5 rounded-full bg-[#c026d3] shadow-[0_0_0_3px_rgba(192,38,211,.15)]" />
          Live
        </div>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div key={task.title} className="flex items-center gap-3 rounded-xl border border-[#eee9e3] bg-[#fffdfa] p-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#e4ded6] bg-white">
              <span className="size-3 rounded border-2 border-[#b2a7b5]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">{task.title}</p>
              <span className={`mt-1 inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-bold ${task.color}`}>{task.tag}</span>
            </div>
            <span className={`flex size-7 items-center justify-center rounded-full text-[9px] font-bold text-[#3f4b46] ${task.avatarColor}`}>{task.avatar}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#eee9e3] pt-4">
        <div className="flex -space-x-2">
          {["bg-[#ecd0b4]", "bg-[#c4d8ec]", "bg-[#ddc8e8]"].map((color, index) => (
            <span key={color} className={`flex size-7 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold ${color}`}>
              {["AM", "JK", "NO"][index]}
            </span>
          ))}
          <span className="flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#eee9f0] text-[9px] font-bold">+4</span>
        </div>
        <p className="text-[10px] font-medium text-[#918796]">7 members studying</p>
      </div>
    </div>
  );
}

export default function Login({ register = false }) {
  const isRegister = register;
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    
    if (isRegister && password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

    fetch(`http://localhost:5000/api/auth/${isRegister ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isRegister && data._id) {
          navigate("/login");
        } else if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/");
        } else {
          alert(data.message || "Something went wrong");
        }
      });
  }

  return (
    <main className="min-h-screen bg-[#f1eef8] p-3 sm:p-6 lg:flex lg:items-center lg:justify-center lg:p-8">
      <section className="mx-auto grid min-h-[560px] w-full max-w-[1240px] overflow-hidden rounded-[28px] bg-[#faf8ff] shadow-[0_28px_80px_rgba(35,15,39,0.14)] lg:h-[min(820px,calc(100vh-64px))] lg:grid-cols-[46%_54%]">
        {/* LEFT */}
        <div className="flex min-h-full flex-col bg-[#faf8ff] px-6 py-7 sm:px-12 sm:py-9 lg:px-[clamp(48px,5vw,76px)]">
          <Logo />

          <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-10 sm:py-12">
            <div className="mb-8">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#7c3aed]">
                {isRegister ? "Join the room" : "Welcome back"}
              </p>
              <h1 className="text-[36px] font-bold leading-tight tracking-[-0.045em] text-[#1a1023] sm:text-[42px]">
                {isRegister ? "Create account" : "Sign in"}
              </h1>
              <p className="mt-3 text-sm text-[#786f7c]">
                {isRegister ? "Already have an account? " : "Don't have an account? "}
                <Link
                  to={isRegister ? "/login" : "/register"}
                  className="font-semibold text-[#7c3aed] transition hover:text-[#6025c7] hover:underline"
                >
                  {isRegister ? "Sign in" : "Create now"}
                </Link>
              </p>
            </div>

            <form onSubmit={submit} className="space-y-[18px]">
              {isRegister && (
                <Field label="Name" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
              )}
              <Field
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder={isRegister ? "Create a secure password" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                right={
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8e8491] transition hover:text-[#1a1023]"
                  >
                    <EyeIcon hidden={!showPassword} />
                  </button>
                }
              />

              <div className="flex items-center justify-between gap-4 text-[13px]">
                <label className="flex cursor-pointer items-center gap-2.5 text-[#665c69]">
                  <input type="checkbox" className="size-4 accent-[#7c3aed]" />
                  Remember me
                </label>
                {!isRegister && (
                  <a href="#" className="font-semibold text-[#7c3aed] transition hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>

              <button
                type="submit"
                className="h-[52px] w-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#f472b6] text-sm font-bold text-white shadow-[0_12px_28px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_15px_32px_rgba(124,58,237,0.38)] active:translate-y-0"
              >
                {isRegister ? "Create account" : "Sign in"}
              </button>

              <div className="flex items-center gap-3 py-0.5 text-[12px] text-[#99a39e]">
                <span className="h-px flex-1 bg-[#e4dff0]" />
                or
                <span className="h-px flex-1 bg-[#e4dff0]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {["Google", "GitHub"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    className="flex h-[48px] items-center justify-center gap-2.5 rounded-xl border border-[#e4dff0] bg-white text-[13px] font-semibold text-[#1a1023] transition hover:border-[#c8bce0] hover:bg-[#f7f3ff]"
                  >
                    <SocialIcon provider={provider} />
                    Continue with {provider}
                  </button>
                ))}
              </div>
            </form>
          </div>

          <p className="text-[11px] text-[#9aa49f]">© 2026 StudyRoom. Learn better, together.</p>
        </div>

        {/* RIGHT */}
        <aside className="study-panel relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col">
          <div className="aurora-blobs absolute inset-0" aria-hidden="true">
            <span className="absolute -right-24 -top-28 size-[440px] rounded-full bg-[#e9d5ff] opacity-[0.35]" />
            <span className="absolute -bottom-36 -left-28 size-[480px] rounded-full bg-[#c026d3] opacity-[0.4]" />
          </div>

          <div className="relative z-10 flex justify-end">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md transition hover:bg-white/15"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5A7 7 0 0 1 3 12v-2a5 5 0 0 1 5-5h9a4 4 0 0 1 4 4v6Z" />
              </svg>
              Support
            </button>
          </div>

          <div className="relative z-10 my-auto w-full px-2 xl:px-8">
            <TaskBoard />
            <div className="mx-auto mt-11 max-w-[470px] text-center">
              <h2 className="text-[30px] font-bold tracking-[-0.04em] xl:text-[34px]">Study together, in real time</h2>
              <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-white/65">
                Keep shared tasks, notes, and AI-powered summaries in sync, so everyone can focus on making progress.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}