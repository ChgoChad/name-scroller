import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Name Scroller</CardTitle>
          <CardDescription>
            Display names with smooth scrolling animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/presentation" className="block" target="_blank" rel="noopener noreferrer">
            <Button className="w-full" size="lg">
              Open Presentation View
            </Button>
          </Link>
          <Link href="/names" className="block" target="_blank" rel="noopener noreferrer">
            <Button className="w-full" size="lg" variant="outline">
              Update Names
            </Button>
          </Link>
          <Link href="/admin" className="block" target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-transparent" size="lg" variant="outline">
              Open Admin Panel
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
