export default function Footer() {
  return (
    <footer className="bg-base-200 text-base-content py-6">
      <div className="container mx-auto flex flex-col items-center text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} SODA Inc. Todos los derechos reservados.
        </p>
        <div className="flex gap-4 mt-2">
          <a href="#" className="link link-hover">Términos</a>
          <a href="#" className="link link-hover">Privacidad</a>
          <a href="#" className="link link-hover">Contacto</a>
        </div>
      </div>
    </footer>
  );
}