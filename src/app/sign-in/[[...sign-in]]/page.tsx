import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#f4f6fa' }}
    >
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-120px] left-[-120px] w-[420px] h-[420px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #e07a5f 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #81b29a 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-md relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight" style={{ color: '#e07a5f' }}>
            MY HOBBY
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Sign in to track your daily habits</p>
        </div>

        <div
          className="w-full rounded-3xl p-1"
          style={{
            boxShadow:
              '8px 8px 20px #d1d9e6, -8px -8px 20px #ffffff, inset -2px -2px 6px rgba(255,255,255,.5), inset 2px 2px 6px rgba(0,0,0,.04)',
          }}
        >
          <SignIn
            appearance={{
              variables: {
                colorPrimary: '#e07a5f',
                colorBackground: '#ffffff',
                colorText: '#2d3142',
                colorTextSecondary: '#6b7280',
                colorInputBackground: '#f4f6fa',
                colorInputText: '#2d3142',
                borderRadius: '1rem',
                fontFamily: 'inherit',
              },
              elements: {
                card: 'shadow-none rounded-3xl border-0',
                rootBox: 'w-full',
                formButtonPrimary:
                  'bg-[#e07a5f] hover:bg-[#c96a4e] text-white font-bold rounded-xl py-3 transition-all hover:scale-[1.02] active:scale-95',
                formFieldInput:
                  'rounded-xl bg-[#f4f6fa] border-0 shadow-inner focus:ring-2 focus:ring-[#e07a5f]',
                footerActionLink: 'text-[#e07a5f] font-semibold hover:underline',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                socialButtonsBlockButton:
                  'rounded-xl border border-gray-200 hover:bg-gray-50 transition-all',
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
