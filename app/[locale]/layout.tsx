import { getMessages, getTimeZone, getNow } from "next-intl/server";
import LocaleProvider from "../../components/locale-provider";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const messages = await getMessages();
  const timeZone = await getTimeZone();
  const now = await getNow();
  const resolvedParams = await params;
  const locale = resolvedParams?.locale;

  return (
    <LocaleProvider
      messages={messages}
      locale={locale}
      timeZone={timeZone}
      now={now}
    >
      {children}
    </LocaleProvider>
  );
}
