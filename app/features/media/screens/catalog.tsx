import { useTranslation } from "react-i18next";

export default function CatalogScreen() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold">
          {t("navigation.media.catalog")}
        </h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>카탈로그 내용이 들어갈 예정입니다.</p>
        </div>
      </div>
    </div>
  );
}

