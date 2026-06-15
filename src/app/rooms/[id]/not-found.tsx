import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const surfaceClassName = "aneuk-surface";

export default function RoomRecordNotFound() {
  return (
    <div className="aneuk-shell">
      <main className="aneuk-frame">
        <section className="aneuk-content grid gap-5">
          <Card className={surfaceClassName}>
            <CardHeader className="gap-4">
              <Badge className="rounded-full" variant="outline">
                record not found
              </Badge>
              <CardTitle className="font-serif text-4xl leading-[0.98] tracking-[-0.04em] md:text-6xl">
                찾으려는 방 기록이 없습니다
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-7 text-muted-foreground md:text-[1.05rem]">
                이미 삭제됐거나 현재 로그인한 사용자 소유가 아닌 기록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="rounded-full px-4">
                <Link href="/rooms">목록으로 돌아가기</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
