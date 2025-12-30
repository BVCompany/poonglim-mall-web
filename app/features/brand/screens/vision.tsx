import { useTranslation } from "react-i18next";
import { Target, Users, Heart } from "lucide-react";

export default function BrandVisionScreen() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-4xl font-bold">
          {t("navigation.brand.vision")}
        </h1>
        
        <div className="mb-12 overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200"
            alt="비전"
            className="h-96 w-full object-cover"
          />
        </div>

        <section className="mb-12">
          <h2 className="mb-6 text-center text-3xl font-semibold">우리의 비전</h2>
          <p className="text-muted-foreground mb-8 text-center text-lg">
            "건강한 식문화를 선도하는 글로벌 식품 기업"
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary mb-4 flex size-20 items-center justify-center rounded-full">
                <Target className="size-10" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">혁신</h3>
              <p className="text-muted-foreground">
                끊임없는 연구개발을 통해 새로운 가치를 창출합니다.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary mb-4 flex size-20 items-center justify-center rounded-full">
                <Users className="size-10" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">상생</h3>
              <p className="text-muted-foreground">
                고객, 파트너와 함께 성장하는 기업이 되겠습니다.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/10 text-primary mb-4 flex size-20 items-center justify-center rounded-full">
                <Heart className="size-10" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">진정성</h3>
              <p className="text-muted-foreground">
                진심을 담아 고객의 건강을 책임집니다.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-semibold">핵심 가치</h2>
          <div className="space-y-4">
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">고객 중심</h3>
              <p className="text-muted-foreground">
                모든 의사결정의 중심에는 고객이 있습니다.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">품질 최우선</h3>
              <p className="text-muted-foreground">
                최고의 품질을 위해 타협하지 않습니다.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <h3 className="mb-2 text-lg font-semibold">지속 가능성</h3>
              <p className="text-muted-foreground">
                환경과 사회를 생각하는 기업 활동을 실천합니다.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

