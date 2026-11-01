import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { Footer } from '@/components/Footer';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[{ text: "Documentation", url: "/docs" }, { text: "Plugins", url: "/plugins" }, { text: "Download", url: "/download" }]}
      searchToggle={{ enabled: false }}
      themeSwitch={{ enabled: false }}
      className="[--fd-layout-width:100%]"
    >
      {children}
      <Footer />
    </HomeLayout>
  );
}
