export interface ArucoCorner {
  position: 'TL' | 'TR' | 'BR' | 'BL'
  x: number
  y: number
}

export interface ArucoPoint {
  x: number
  y: number
}

export interface ArucoHitbox {
  xPos: number
  xNeg: number
  yPos: number
  yNeg: number
}

export interface CorridorSide {
  origin: ArucoPoint
  far_start: ArucoPoint
  far_end: ArucoPoint
}

export interface ArucoNodeMarker {
  id: number
  marker_id: number
  center_x: number
  center_y: number
  rotation: number
  ocr_text: string | null
  corners: ArucoCorner[]
  type: 'node'
  hitbox: ArucoHitbox
  hitbox_corners: ArucoPoint[]
  card_center: ArucoPoint
}

export interface ArucoEdgeMarker {
  id: number
  marker_id: number
  center_x: number
  center_y: number
  rotation: number
  ocr_text: string | null
  corners: ArucoCorner[]
  type: 'directionless' | 'monodirectional' | 'bidirectional'
  hitbox: ArucoHitbox
  hitbox_corners: ArucoPoint[]
  card_center: ArucoPoint
  is_detected: boolean
  detection_lines: {
    main_start: ArucoPoint
    main_end: ArucoPoint
    center: ArucoPoint
    upper: CorridorSide
    lower: CorridorSide
  }
}

export interface ArucoEdgeRelation {
  id: number
  edge_type: 'directionless' | 'monodirectional' | 'bidirectional'
  edge_marker_id: number
  source_marker_id: number
  target_marker_id: number
}

export interface ArucoConfig {
  edge_margin: number
  edge_angle_margin: number
}

export interface ArucoData {
  node_markers: ArucoNodeMarker[]
  edge_markers: ArucoEdgeMarker[]
  edges: ArucoEdgeRelation[]
  config: ArucoConfig
}
