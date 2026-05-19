export interface ArucoCorner {
  position: 'top_left' | 'top_right' | 'bottom_right' | 'bottom_left'
  x: number
  y: number
}

export interface ArucoPoint {
  x: number
  y: number
}

export interface ArucoMarker {
  id: number
  marker_id: number
  center_x: number
  center_y: number
  ocr_text: string | null
  corners: ArucoCorner[]
  hitbox_corners: ArucoPoint[]
}

export interface CorridorSide {
  origin: ArucoPoint
  far_start: ArucoPoint
  far_end: ArucoPoint
}

export interface ArucoEdge {
  id: number
  detection_lines: {
    main_start: ArucoPoint
    main_end: ArucoPoint
    upper: CorridorSide
    lower: CorridorSide
  }
}

export interface ArucoData {
  markers: ArucoMarker[]
  edges: ArucoEdge[]
}
