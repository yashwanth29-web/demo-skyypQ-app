/**
 * Generates a smooth, realistic driving route corridor between start and destination coordinates in Hyderabad
 * Uses quadratic Bezier curve interpolation from start to destination.
 */
export function generateRouteWaypoints(
  sLat = 17.4156,
  sLng = 78.3425,
  eLat = 17.3616,
  eLng = 78.4747
) {
  const steps = 50
  const routePoints = []

  // Add subtle natural road curvature
  const midLat = (sLat + eLat) / 2 + 0.015
  const midLng = (sLng + eLng) / 2 + 0.010

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Quadratic Bezier curve from start -> mid -> end
    const lat = (1 - t) * (1 - t) * sLat + 2 * (1 - t) * t * midLat + t * t * eLat
    const lng = (1 - t) * (1 - t) * sLng + 2 * (1 - t) * t * midLng + t * t * eLng
    routePoints.push([lat, lng])
  }

  return routePoints
}

/**
 * Maps a list of restaurants along the route with directional side anchoring to guarantee zero pin overlapping
 */
export function mapRestaurantsAlongRoute(restaurants = [], routePoints = []) {
  if (!restaurants.length || !routePoints.length) return restaurants

  const count = Math.min(restaurants.length, 10)
  const selected = restaurants.slice(0, count)

  return selected.map((r, index) => {
    // Spread evenly across 6% to 94% of the orange route line
    const progress = 0.06 + (index / Math.max(1, count - 1)) * 0.88
    const pointIdx = Math.min(Math.floor(progress * (routePoints.length - 1)), routePoints.length - 2)

    const pCurrent = routePoints[pointIdx]
    const pNext = routePoints[pointIdx + 1] || pCurrent

    // Tangent unit vector along route
    const dLat = pNext[0] - pCurrent[0]
    const dLng = pNext[1] - pCurrent[1]
    const len = Math.sqrt(dLat * dLat + dLng * dLng) || 0.001

    // Perpendicular normal vector (-dLng/len, dLat/len)
    const normLat = -dLng / len
    const normLng = dLat / len

    // Alternate left (+1) and right (-1) side of route
    const isLeft = index % 2 === 0
    const side = isLeft ? 1 : -1

    // Small offset (0.0006 degrees = ~60m)
    const offsetMagnitude = 0.0006

    const finalLat = pCurrent[0] + side * normLat * offsetMagnitude
    const finalLng = pCurrent[1] + side * normLng * offsetMagnitude

    return {
      ...r,
      side: isLeft ? 'left' : 'right',
      coordinates: {
        lat: finalLat,
        lng: finalLng
      }
    }
  })
}
