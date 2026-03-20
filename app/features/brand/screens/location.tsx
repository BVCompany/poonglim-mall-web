/**
 * 오시는 길 페이지
 */
import { MapPin, Phone, Clock, Bus, Car } from "lucide-react";
import type { Route } from "./+types/location";

export function meta(_: Route.MetaArgs) {
  return [{ title: "오시는 길 | 풍림푸드" }];
}

export default function LocationScreen() {
  return (
    <div className="min-h-screen bg-[#F5F2EB]">
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:px-6 lg:px-10">
        <h1
          className="mb-12 text-center text-4xl font-extrabold tracking-tight"
          style={{ color: "#003F2B", letterSpacing: "-0.04em" }}
        >
          오시는 길
        </h1>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* 지도 영역 */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3162.!2d127.0!3d37.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z7Y!5e0!3m2!1sko!2skr!4v1"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="풍림푸드 위치"
              className="w-full"
            />
          </div>

          {/* 정보 카드 */}
          <div className="flex flex-col gap-6">
            {/* 주소 */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAE3C9]">
                  <MapPin className="h-5 w-5" style={{ color: "#003F2B" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#003F2B" }}>주소</h2>
              </div>
              <p className="text-gray-600">경기도 성남시 중원구 ○○로 ○○번길 ○○</p>
              <p className="mt-1 text-sm text-gray-400">(우편번호: 13000)</p>
            </div>

            {/* 연락처 */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAE3C9]">
                  <Phone className="h-5 w-5" style={{ color: "#003F2B" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#003F2B" }}>연락처</h2>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>대표전화: 031-000-0000</p>
                <p>팩스: 031-000-0001</p>
                <p>이메일: info@poonglimfood.com</p>
              </div>
            </div>

            {/* 운영시간 */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAE3C9]">
                  <Clock className="h-5 w-5" style={{ color: "#003F2B" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#003F2B" }}>운영시간</h2>
              </div>
              <div className="space-y-2 text-gray-600">
                <p>평일: 09:00 ~ 18:00</p>
                <p>점심시간: 12:00 ~ 13:00</p>
                <p className="text-sm text-gray-400">토·일·공휴일 휴무</p>
              </div>
            </div>

            {/* 교통안내 */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAE3C9]">
                  <Bus className="h-5 w-5" style={{ color: "#003F2B" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#003F2B" }}>교통안내</h2>
              </div>
              <div className="space-y-3 text-gray-600">
                <div>
                  <p className="font-medium text-gray-700">지하철</p>
                  <p className="text-sm">○호선 ○○역 ○번 출구 도보 10분</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">버스</p>
                  <p className="text-sm">○○번, ○○번 ○○정류장 하차</p>
                </div>
                <div className="flex items-start gap-2">
                  <Car className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <p className="text-sm">주차 가능 (방문 전 사전 연락 권장)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
