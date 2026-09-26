import { usePWAInstall } from "./usePWAInstall";

export function usePwaInstallPrompt() {
  const { isInstallable, install, isInstalled, isIOS } = usePWAInstall();

  return {
    isInstallable,
    installPwa: install,
    isInstalled,
    isIOS,
  };
}
