/*
    I found I had to use this function in a few files so I made a file where it can be imported into different files
*/
export function isEventExpired(eventDate) {
  if (!eventDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const eventDay = new Date(eventDate)
  eventDay.setHours(0, 0, 0, 0)

  return eventDay < today
}