/**
 * 최고관리자(super admin) 계정 생성 스크립트
 *
 * 사용법:
 *   npx tsx scripts/create-super-admin.ts \
 *     --name "홍길동" \
 *     --email "admin@example.com" \
 *     --password "안전한비밀번호"
 *
 * 또는 환경변수 사용:
 *   ADMIN_NAME="홍길동" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="비밀번호" \
 *     npx tsx scripts/create-super-admin.ts
 */

import { config } from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";

// .env 로드
config({ path: path.resolve(process.cwd(), ".env") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL 환경변수가 설정되어 있지 않습니다.");
  process.exit(1);
}

// CLI 인수 파싱
function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const name = getArg("--name") ?? process.env.ADMIN_NAME;
  const email = getArg("--email") ?? process.env.ADMIN_EMAIL;
  const password = getArg("--password") ?? process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("❌ --name, --email, --password 가 모두 필요합니다.");
    console.error("사용법: npx tsx scripts/create-super-admin.ts --name 이름 --email 이메일 --password 비밀번호");
    process.exit(1);
  }

  const client = postgres(DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  // 동적 import (서버 전용 모듈)
  const { admins } = await import("../app/features/admin/schema.js");

  // 이미 존재하는지 확인
  const existing = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (existing.length > 0) {
    console.log(`⚠️  이미 해당 이메일로 계정이 존재합니다: ${email}`);
    console.log(`   이름: ${existing[0].name}, 역할: ${existing[0].role}`);
    await client.end();
    process.exit(0);
  }

  // 비밀번호 해싱
  const password_hash = await bcrypt.hash(password, 12);

  // 계정 생성
  const [created] = await db
    .insert(admins)
    .values({
      name,
      email,
      password_hash,
      role: "super",
      permissions: ["products", "recipes", "events", "careers", "banners", "admins", "inquiries"],
      is_active: true,
    })
    .returning({
      admin_id: admins.admin_id,
      name: admins.name,
      email: admins.email,
      role: admins.role,
    });

  console.log("\n✅ 최고관리자 계정이 생성되었습니다!");
  console.log("──────────────────────────────────");
  console.log(`   ID    : ${created.admin_id}`);
  console.log(`   이름  : ${created.name}`);
  console.log(`   이메일: ${created.email}`);
  console.log(`   역할  : ${created.role} (최고관리자)`);
  console.log("──────────────────────────────────");
  console.log("⚠️  비밀번호를 안전하게 보관하세요.\n");

  await client.end();
}

main().catch((err) => {
  console.error("❌ 오류:", err.message);
  process.exit(1);
});
