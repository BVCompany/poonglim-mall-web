# 🗄️ 데이터베이스 설정 가이드

## 📋 목차
- [개요](#개요)
- [Supabase 프로젝트 생성](#supabase-프로젝트-생성)
- [환경 변수 설정](#환경-변수-설정)
- [데이터베이스 스키마](#데이터베이스-스키마)
- [타입 생성](#타입-생성)
- [관리자 페이지 개발](#관리자-페이지-개발)

---

## 🎯 개요

이 프로젝트는 향후 데이터베이스를 활용한 동적 콘텐츠 관리를 위해 Supabase 인프라가 준비되어 있습니다.

### 활용 예정 기능
- 📝 게시판 관리 (뉴스, 공지사항)
- 📅 이벤트 관리
- 💼 채용공고 관리
- 🥚 제품 정보 관리
- 👨‍🍳 레시피 관리
- 👤 관리자 인증 및 권한 관리

---

## 🚀 Supabase 프로젝트 생성

### 1. Supabase 회원가입
```
https://supabase.com
→ "Start your project" 클릭
→ GitHub 계정으로 로그인
```

### 2. 새 프로젝트 생성
```
1. Organization 선택 또는 생성
2. "New Project" 클릭
3. 프로젝트 설정:
   - Name: poonglim-mall-prod (운영용)
   - Database Password: 강력한 비밀번호 생성
   - Region: Northeast Asia (Seoul)
   - Pricing Plan: Free (시작) 또는 Pro
4. "Create new project" 클릭
```

### 3. 개발용 프로젝트 생성 (선택사항)
```
개발/테스트용 별도 프로젝트 생성:
- Name: poonglim-mall-dev
- 동일한 설정으로 생성
```

---

## 🔐 환경 변수 설정

### Supabase API Key 확인

**Supabase Dashboard:**
```
Settings > API
```

다음 값을 복사:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon/public key**: `eyJhbGci...` (공개 키)
- **service_role key**: `eyJhbGci...` (관리자 키, 비공개!)

### Vercel 환경 변수 설정

**Vercel Dashboard > Settings > Environment Variables:**

#### Production (main 브랜치)
```bash
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_ANON_KEY=your-prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
```

#### Preview (develop 브랜치)
```bash
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
```

#### Local (.env.local)
```bash
# .env.local 파일 생성 (Git에 커밋하지 말 것!)
SUPABASE_URL=https://your-dev-project.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key
```

---

## 📊 데이터베이스 스키마

### 1. 게시판 테이블

**Supabase Dashboard > SQL Editor:**

```sql
-- 게시판 테이블
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  category TEXT NOT NULL, -- 'news', 'notice', 'event'
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  thumbnail_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX posts_category_idx ON posts(category);
CREATE INDEX posts_status_idx ON posts(status);
CREATE INDEX posts_published_at_idx ON posts(published_at DESC);

-- RLS (Row Level Security) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 공개 게시글은 누구나 읽기 가능
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (status = 'published');

-- 관리자만 작성/수정/삭제 가능
CREATE POLICY "Admins can manage posts"
  ON posts FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 2. 이벤트 테이블

```sql
-- 이벤트 테이블
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'ended'
  location TEXT,
  image_url TEXT,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  benefits TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX events_status_idx ON events(status);
CREATE INDEX events_date_idx ON events(start_date, end_date);

-- RLS 설정
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_date > CURRENT_DATE THEN
    NEW.status := 'upcoming';
  ELSIF NEW.end_date < CURRENT_DATE THEN
    NEW.status := 'ended';
  ELSE
    NEW.status := 'ongoing';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_status_trigger
  BEFORE INSERT OR UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_status();
```

### 3. 채용공고 테이블

```sql
-- 채용공고 테이블
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  position TEXT NOT NULL,
  employment_type TEXT, -- 'full-time', 'part-time', 'contract'
  location TEXT,
  description TEXT,
  responsibilities TEXT[],
  requirements TEXT[],
  preferred_qualifications TEXT[],
  benefits TEXT[],
  salary_range TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  deadline DATE,
  is_urgent BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX job_postings_status_idx ON job_postings(status);
CREATE INDEX job_postings_department_idx ON job_postings(department);
CREATE INDEX job_postings_deadline_idx ON job_postings(deadline);

-- RLS 설정
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read open job postings"
  ON job_postings FOR SELECT
  USING (status = 'open');

CREATE POLICY "Admins can manage job postings"
  ON job_postings FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 4. 제품 테이블

```sql
-- 제품 테이블
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  category TEXT NOT NULL, -- 'liquid-eggs', 'puddings', 'convenience'
  description TEXT,
  description_en TEXT,
  description_es TEXT,
  price INTEGER,
  original_price INTEGER,
  discount_percentage INTEGER,
  image_url TEXT,
  images TEXT[],
  tags TEXT[],
  specifications JSONB,
  is_new BOOLEAN DEFAULT false,
  is_best BOOLEAN DEFAULT false,
  is_on_sale BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'out_of_stock'
  view_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX products_category_idx ON products(category);
CREATE INDEX products_status_idx ON products(status);
CREATE INDEX products_tags_idx ON products USING gin(tags);

-- RLS 설정
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 5. 레시피 테이블

```sql
-- 레시피 테이블
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  category TEXT NOT NULL, -- 'home', 'cafe', 'restaurant'
  difficulty TEXT, -- 'easy', 'medium', 'hard'
  description TEXT,
  cook_time INTEGER, -- 분 단위
  servings INTEGER,
  rating DECIMAL(2,1) DEFAULT 0,
  image_url TEXT,
  images TEXT[],
  ingredients JSONB[], -- [{ name, amount, unit }]
  steps JSONB[], -- [{ step, description, image }]
  tips TEXT[],
  nutrition JSONB, -- { calories, protein, fat, carbs }
  tags TEXT[],
  related_products UUID[],
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published', -- 'draft', 'published'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX recipes_category_idx ON recipes(category);
CREATE INDEX recipes_difficulty_idx ON recipes(difficulty);
CREATE INDEX recipes_tags_idx ON recipes USING gin(tags);

-- RLS 설정
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published recipes"
  ON recipes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage recipes"
  ON recipes FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');
```

### 6. 관리자 테이블

```sql
-- 관리자 프로필 테이블
CREATE TABLE admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'editor', -- 'super_admin', 'admin', 'editor'
  department TEXT,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read their own profile"
  ON admin_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all profiles"
  ON admin_profiles FOR ALL
  USING (auth.jwt() ->> 'role' = 'super_admin');
```

---

## 🔨 타입 생성

### 로컬에서 타입 생성

```bash
# Supabase CLI 설치 (한 번만)
npm install -g supabase

# Supabase 프로젝트 연결
npx supabase login

# 타입 생성
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > app/database.types.ts
```

### package.json 스크립트 수정

```json
{
  "scripts": {
    "db:typegen": "supabase gen types typescript --project-id YOUR_PROJECT_ID > app/database.types.ts"
  }
}
```

이제 `npm run db:typegen` 명령으로 타입을 재생성할 수 있습니다.

---

## 👨‍💼 관리자 페이지 개발

### 라우트 추가

**app/routes.ts:**

```typescript
// 관리자 라우트 추가
route("/admin", "features/admin/layouts/admin.layout.tsx", [
  index("features/admin/screens/dashboard.tsx"),
  route("posts", "features/admin/screens/posts/index.tsx"),
  route("posts/new", "features/admin/screens/posts/new.tsx"),
  route("posts/:id/edit", "features/admin/screens/posts/edit.tsx"),
  route("events", "features/admin/screens/events/index.tsx"),
  route("events/new", "features/admin/screens/events/new.tsx"),
  route("events/:id/edit", "features/admin/screens/events/edit.tsx"),
  route("jobs", "features/admin/screens/jobs/index.tsx"),
  route("jobs/new", "features/admin/screens/jobs/new.tsx"),
  route("jobs/:id/edit", "features/admin/screens/jobs/edit.tsx"),
  route("products", "features/admin/screens/products/index.tsx"),
  route("products/new", "features/admin/screens/products/new.tsx"),
  route("products/:id/edit", "features/admin/screens/products/edit.tsx"),
  route("recipes", "features/admin/screens/recipes/index.tsx"),
  route("recipes/new", "features/admin/screens/recipes/new.tsx"),
  route("recipes/:id/edit", "features/admin/screens/recipes/edit.tsx"),
]),
```

### 관리자 인증 가드

**app/features/admin/layouts/admin.layout.tsx:**

```typescript
import { redirect } from "react-router";
import type { Route } from "./+types/admin.layout";
import makeServerClient from "~/core/lib/supa-client.server";

export async function loader({ request }: Route.LoaderArgs) {
  const [client, headers] = makeServerClient(request);
  
  // 사용자 인증 확인
  const { data: { user }, error } = await client.auth.getUser();
  
  if (error || !user) {
    throw redirect("/auth/login?redirect=/admin");
  }
  
  // 관리자 권한 확인
  const { data: profile } = await client
    .from("admin_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!profile || !["super_admin", "admin", "editor"].includes(profile.role)) {
    throw redirect("/");
  }
  
  return { user, profile };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-64 bg-gray-900 text-white">
        {/* 네비게이션 메뉴 */}
      </aside>
      
      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

---

## 📝 다음 단계

### 1. Supabase 설정 (1일)
- [ ] 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] 데이터베이스 스키마 생성

### 2. 관리자 페이지 기본 구조 (3-5일)
- [ ] 레이아웃 구현
- [ ] 네비게이션 메뉴
- [ ] 대시보드 페이지

### 3. 게시판 관리 (1주)
- [ ] 목록 페이지
- [ ] 작성/수정 페이지
- [ ] CRUD API

### 4. 이벤트 관리 (1주)
- [ ] 목록 페이지
- [ ] 작성/수정 페이지
- [ ] 이미지 업로드

### 5. 채용공고 관리 (1주)
- [ ] 목록 페이지
- [ ] 작성/수정 페이지
- [ ] 지원자 관리

### 6. 제품/레시피 관리 (2주)
- [ ] 제품 CRUD
- [ ] 레시피 CRUD
- [ ] 이미지 갤러리

---

## 🔗 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Drizzle ORM 문서](https://orm.drizzle.team/docs/overview)

---

**마지막 업데이트**: 2025-12-30

