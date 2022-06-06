import { Listener } from '../../../../hiei.js'

class MemberJoin extends Listener {
  constructor () {
    super({
      name: 'MemberJoin',
      emitter: 'client',
      event: 'guildMemberAdd'
    })
  }

  run (member) {
    console.log(`<@${member.user.id}> joined the community`)
  }
}

export default MemberJoin
