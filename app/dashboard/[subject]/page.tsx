// app/dashboard/[subject]/page.tsx

// import AttendanceSheetAdmin_view from '@/components/dashboard/AttendanceSheetAdmin_view'
import AdminDashboard from '@/components/dashboard_view/AdminDashboard'
// import TeacherDashboard from '@/components/dashboard_view/TeacherDashboard'


const page = () => {
  return (
    <>
    {/* <AttendanceSheetAdmin_view /> */}
    {/* <TeacherDashboard /> */}
    <AdminDashboard />
    </>
  )
}

export default page