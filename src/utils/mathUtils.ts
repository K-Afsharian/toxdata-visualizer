// src/utils/mathUtils.ts
import { QuadraticRegressionResult } from "../interfaces";

function determinant3x3(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function calculateQuadraticRegression(
  points: { x: number; y: number }[]
): QuadraticRegressionResult | null {
  if (points.length < 3) return null;

  let sumX = 0,
    sumY = 0,
    sumX2 = 0,
    sumX3 = 0,
    sumX4 = 0,
    sumXY = 0,
    sumX2Y = 0;
  const n = points.length;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumX2 += p.x * p.x;
    sumX3 += p.x * p.x * p.x;
    sumX4 += p.x * p.x * p.x * p.x;
    sumXY += p.x * p.y;
    sumX2Y += p.x * p.x * p.y;
  }

  const matrixM = [
    [n, sumX, sumX2],
    [sumX, sumX2, sumX3],
    [sumX2, sumX3, sumX4],
  ];
  const vectorR = [sumY, sumXY, sumX2Y];

  const detM = determinant3x3(matrixM);
  if (Math.abs(detM) < 1e-10) return null; // Avoid division by zero/very small number

  const matrixC0 = [
    [vectorR[0], matrixM[0][1], matrixM[0][2]],
    [vectorR[1], matrixM[1][1], matrixM[1][2]],
    [vectorR[2], matrixM[2][1], matrixM[2][2]],
  ];
  const matrixC1 = [
    [matrixM[0][0], vectorR[0], matrixM[0][2]],
    [matrixM[1][0], vectorR[1], matrixM[1][2]],
    [matrixM[2][0], vectorR[2], matrixM[2][2]],
  ];
  const matrixC2 = [
    [matrixM[0][0], matrixM[0][1], vectorR[0]],
    [matrixM[1][0], matrixM[1][1], vectorR[1]],
    [matrixM[2][0], matrixM[2][1], vectorR[2]],
  ];

  const c = determinant3x3(matrixC0) / detM;
  const b = determinant3x3(matrixC1) / detM;
  const a = determinant3x3(matrixC2) / detM; // Corrected line

  return { a, b, c, predict: (x: number) => a * x * x + b * x + c };
}
