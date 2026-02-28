export default function Footer() {
  return (
    <footer className="border-t py-6 mt-16">
      <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TechMindsVerse. All rights reserved.
      </div>
    </footer>
  )
}