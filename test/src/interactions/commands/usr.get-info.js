export default {
  interaction: 'user',
  name: 'Get Info',
  execute ({ interaction, user }) {
    return interaction.reply({ content: `User: ${user.username}, ID: ${user.id}` })
  }
}
