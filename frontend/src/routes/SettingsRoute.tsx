import { useState, type ReactNode } from 'react';

type SettingsTab = 'account' | 'notifications' | 'appearance' | 'language';

type TabIcon = (props: { active?: boolean }) => ReactNode;

const TABS: { id: SettingsTab; label: string; icon: TabIcon }[] = [
  { id: 'account', label: 'Account', icon: UserIcon },
  { id: 'notifications', label: 'Notifications', icon: BellIcon },
  { id: 'appearance', label: 'Appearance', icon: SunIcon },
  { id: 'language', label: 'Language & Region', icon: GlobeIcon },
];

const TAB_META: Record<SettingsTab, { title: string; subtitle: string }> = {
  account: {
    title: 'Account',
    subtitle: 'Manage your account information and security',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Manage how you receive notifications',
  },
  appearance: {
    title: 'Appearance',
    subtitle: 'Customize how the application looks',
  },
  language: {
    title: 'Language & Region',
    subtitle: 'Set your language and regional preferences',
  },
};

const DEMO_NAME = 'Alexander Skibinski';
const DEMO_EMAIL = 'askib06@uw.edu';
const DEMO_INITIAL = 'A';

export function SettingsRoute() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const meta = TAB_META[activeTab];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-['IBM_Plex_Sans',sans-serif] text-black">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-[#E1E1E1] bg-white">
        <div className="border-b border-[#E1E1E1] px-6 py-6">
          <h1 className="text-[22px] leading-7 font-bold">Settings</h1>
        </div>

        <nav className="flex flex-col gap-1 p-4" aria-label="Settings sections">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-[15px] leading-[22.5px] font-semibold transition ${
                  active
                    ? 'bg-[#EFF6FF] text-[#615FFF]'
                    : 'text-[#364153] hover:bg-[#F8F9FA]'
                }`}
              >
                <Icon active={active} />
                {label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-[42px] py-[42px]">
        <header className="mb-8">
          <h2 className="text-[28px] leading-9 font-bold">{meta.title}</h2>
          <p className="mt-2 text-sm leading-[21px] text-[#5D5D5D]">{meta.subtitle}</p>
        </header>

        {activeTab === 'account' && <AccountPanel />}
        {activeTab === 'notifications' && <NotificationsPanel />}
        {activeTab === 'appearance' && <AppearancePanel />}
        {activeTab === 'language' && <LanguagePanel />}
      </main>
    </div>
  );
}

function AccountPanel() {
  return (
    <div className="flex max-w-[716px] flex-col gap-8">
      <SettingsCard title="Profile">
        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#615FFF] text-[28px] leading-[42px] font-bold text-white">
            {DEMO_INITIAL}
          </div>
          <div>
            <p className="text-base leading-6 font-bold">{DEMO_NAME}</p>
            <p className="text-sm leading-[21px] text-[#5D5D5D]">{DEMO_EMAIL}</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-6 rounded-lg border border-[#E1E1E1] bg-white px-4 py-2 text-sm leading-[21px] font-semibold text-[#364153] transition hover:bg-[#F8F9FA]"
        >
          Change Profile Picture
        </button>
      </SettingsCard>

      <SettingsCard title="Email Addresses">
        <p className="mt-2 text-sm leading-[21px] text-[#5D5D5D]">
          You will only receive emails from UW at your primary email address.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FBFC] px-[17px] py-[13px]">
          <span className="text-[15px] leading-[22.5px]">{DEMO_EMAIL}</span>
          <span className="text-xs leading-[18px] font-bold tracking-[0.6px] text-[#615FFF] uppercase">
            Primary
          </span>
        </div>
        <div className="mt-4 flex gap-3">
          <input
            type="email"
            readOnly
            placeholder="Add email address"
            className="min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-[#F9FBFC] px-4 py-2 text-sm text-[#99A1AF] placeholder:text-[#99A1AF]"
          />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-[#615FFF] px-4 py-2 text-sm leading-[21px] font-semibold text-white transition hover:bg-[#4A47CC]"
          >
            Add
          </button>
        </div>
      </SettingsCard>

      <SettingsCard title="Account Security">
        <button
          type="button"
          className="mt-4 rounded-lg border border-[#E1E1E1] bg-white px-4 py-2 text-sm leading-[21px] font-semibold text-[#364153] transition hover:bg-[#F8F9FA]"
        >
          Change Password
        </button>
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[rgba(97,95,255,0.2)] bg-[#EFF6FF] px-4 py-4">
          <InfoIcon />
          <p className="text-[13px] leading-[19.5px] text-[#364153]">
            Your organization/school uses SSO, please change your password at your
            organization&apos;s site.
          </p>
        </div>
      </SettingsCard>

      <SettingsCard title="Log Out All Sessions">
        <p className="mt-2 text-sm leading-[21px] text-[#5D5D5D]">
          This will sign you out from all devices and browsers
        </p>
        <button
          type="button"
          className="mt-4 rounded-lg border border-[#E1E1E1] bg-white px-4 py-2 text-sm leading-[21px] font-semibold text-[#D32F2F] transition hover:bg-[#FEF2F2]"
        >
          Log Out All Sessions
        </button>
      </SettingsCard>
    </div>
  );
}

function NotificationsPanel() {
  return (
    <div className="max-w-[716px]">
      <SettingsCard title="Email Notifications">
        <div className="mt-4 flex flex-col gap-4">
          <ToggleRow
            title="Course Announcements"
            description="Receive emails when instructors post announcements"
            defaultOn
          />
          <ToggleRow
            title="Assignment Reminders"
            description="Get reminders about upcoming assignment deadlines"
            defaultOn
          />
          <ToggleRow
            title="Grade Updates"
            description="Receive notifications when grades are posted"
            defaultOn
          />
        </div>
      </SettingsCard>
    </div>
  );
}

function AppearancePanel() {
  return (
    <div className="max-w-[716px]">
      <SettingsCard title="Theme">
        <div className="mt-4">
          <ToggleRow
            title="Dark Mode"
            description="Use dark theme across the application"
            defaultOn={false}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

function LanguagePanel() {
  return (
    <div className="flex max-w-[716px] flex-col gap-8">
      <SettingsCard title="Language">
        <DropdownField label="Display Language" />
      </SettingsCard>

      <SettingsCard title="Region">
        <DropdownField label="Time Zone" />
      </SettingsCard>
    </div>
  );
}

function SettingsCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
      <h3 className="text-lg leading-6 font-bold">{title}</h3>
      {children}
    </section>
  );
}

function ToggleRow({
  title,
  description,
  defaultOn,
}: {
  title: string;
  description: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#E5E7EB] px-4 py-4">
      <div>
        <p className="text-[15px] leading-[22.5px] font-semibold">{title}</p>
        <p className="mt-1 text-[13px] leading-[19.5px] text-[#5D5D5D]">{description}</p>
      </div>
      <ToggleSwitch checked={on} onChange={setOn} label={title} />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked ? 'bg-[#615FFF]' : 'bg-[#E5E7EB]'
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function DropdownField({ label }: { label: string }) {
  return (
    <div className="mt-4">
      <p className="text-xs leading-[18px] font-bold tracking-[0.6px] text-[#99A1AF] uppercase">
        {label}
      </p>
      <div className="relative mt-1 h-[50px] rounded-[10px] border border-[#E5E7EB] bg-[#F9FBFC]">
        <span className="sr-only">{label}</span>
        <ChevronDownIcon />
      </div>
    </div>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-[#99A1AF]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function UserIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-5 ${active ? 'text-[#615FFF]' : 'text-[#364153]'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-5 ${active ? 'text-[#615FFF]' : 'text-[#364153]'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SunIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-5 ${active ? 'text-[#615FFF]' : 'text-[#364153]'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function GlobeIcon({ active }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`size-5 ${active ? 'text-[#615FFF]' : 'text-[#364153]'}`} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#615FFF]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
