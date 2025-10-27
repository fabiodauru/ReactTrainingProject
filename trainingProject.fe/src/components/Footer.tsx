const Footer = () => {
  return (
    <footer className="bg-[color:var(--color-primary)] text-[color:var(--color-foreground)] py-4">
      <div className="container mx-auto text-center">
        <p className="text-[color:var(--color-foreground)]">
          &copy; {new Date().getFullYear()} TravelBucket. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
