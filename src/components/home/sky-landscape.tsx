/** Pure-CSS sky decoration (clouds + hills) for the home hero — no images,
    so it stays a Server Component and holds together at any viewport width. */
export function SkyLandscape() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="landscape">
        <div className="hill hill-back" />
        <div className="hill hill-front" />
      </div>
    </div>
  );
}
