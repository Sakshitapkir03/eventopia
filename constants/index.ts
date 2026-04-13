export const headerLinks = [
  {
    label: 'Home',
    route: '/',
  },
  {
    label: 'Create Event',
    route: '/events/create',
  },
  {
    label: 'My Profile',
    route: '/profile',
  },
]

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(10, 0, 0, 0)

const tomorrowEnd = new Date(tomorrow)
tomorrowEnd.setHours(14, 0, 0, 0)

export const eventDefaultValues = {
  title: '',
  description: '',
  location: '',
  imageUrl: '',
  startDateTime: tomorrow,
  endDateTime: tomorrowEnd,
  categoryId: '',
  price: '',
  isFree: false,
  url: '',
  capacity: '',
  isPrivate: false,
  refundPolicy: '',
  agenda: [],
}
