import React from 'react';
import { SUPPORTED_LOCALES } from '../../lib/locales';
import { DashboardContent } from '../../components/dashboard/DashboardContent';

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return (
    <div className="flex flex-col gap-8 w-full">
      <DashboardContent locale={locale} />
    </div>
  );
}
