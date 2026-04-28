import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this is the correct path for prisma client

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('id');

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { employeeNumber: employeeId },
      include: {
        branch: true,
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const fullName = [employee.firstName, employee.middleName, employee.lastName]
      .filter(Boolean)
      .join(' ');

    return NextResponse.json({
      name: fullName,
      branch: employee.branch?.name || 'N/A',
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
