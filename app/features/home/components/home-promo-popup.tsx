"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import type { Popup } from "~/features/home/lib/queries.server";

const STORAGE_PREFIX = "poonglim_home_popup_skip_";

function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSkippedToday(popupId: number): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${popupId}`) === localDateKey();
  } catch {
    return false;
  }
}

function setSkipToday(popupId: number) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${popupId}`, localDateKey());
  } catch {
    /* ignore */
  }
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

function PromoImageLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export type HomePromoPopupProps = {
  popups: Popup[];
};

export function HomePromoPopup({ popups }: HomePromoPopupProps) {
  const { t } = useTranslation();
  const [storageNonce, setStorageNonce] = useState(0);
  const [sessionHiddenId, setSessionHiddenId] = useState<number | null>(null);

  const ordered = useMemo(
    () =>
      [...popups].sort((a, b) => {
        const ao = a.sort_order ?? 0;
        const bo = b.sort_order ?? 0;
        if (ao !== bo) return ao - bo;
        return a.popup_id - b.popup_id;
      }),
    [popups],
  );

  const visible = useMemo(() => {
    void storageNonce;
    for (const p of ordered) {
      const src = p.image_url?.trim();
      if (!src) continue;
      if (sessionHiddenId === p.popup_id) continue;
      if (isSkippedToday(p.popup_id)) continue;
      return p;
    }
    return null;
  }, [ordered, storageNonce, sessionHiddenId]);

  const bumpStorage = useCallback(() => setStorageNonce((n) => n + 1), []);

  const handleClose = () => {
    if (visible) setSessionHiddenId(visible.popup_id);
  };

  const handleDontShowToday = () => {
    if (!visible) return;
    setSkipToday(visible.popup_id);
    bumpStorage();
  };

  if (!visible?.image_url?.trim()) return null;

  const img = (
    <img
      src={visible.image_url.trim()}
      alt={visible.title}
      className="block w-full max-h-[min(52vh,328px)] object-cover object-center md:max-h-[349px]"
      loading="eager"
      decoding="async"
    />
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex justify-center md:inset-x-auto md:bottom-6 md:left-6 md:justify-start"
      role="dialog"
      aria-modal="true"
      aria-label={visible.title}
    >
      <div
        className="pointer-events-auto w-full max-w-[375px] overflow-hidden rounded-t-[20px] shadow-[0_0_20px_rgba(0,0,0,0.25)] md:max-w-[400px] md:rounded-[20px]"
      >
        <div className="overflow-hidden bg-white">
          {visible.link_url?.trim() ? (
            <PromoImageLink
              href={visible.link_url.trim()}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A5341] focus-visible:ring-offset-2"
            >
              {img}
            </PromoImageLink>
          ) : (
            img
          )}
        </div>
        <div className="flex h-[45px] min-h-[45px] items-stretch bg-white md:h-12 md:min-h-12">
          <button
            type="button"
            onClick={handleDontShowToday}
            className="flex flex-1 items-center bg-white px-[18.75px] py-0 text-left text-[13.13px] font-light text-[#757575] transition-colors hover:bg-gray-50 md:px-5 md:text-sm"
          >
            {t("home.promoPopup.dontShowToday")}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex w-[137.81px] shrink-0 items-center justify-end bg-white px-[18.75px] py-0 text-[13.13px] font-medium text-black transition-colors hover:bg-gray-50 md:w-[147px] md:px-5 md:text-sm"
          >
            {t("home.promoPopup.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
