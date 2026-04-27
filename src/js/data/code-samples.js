export const codeSamples = {
  
HTML5: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARTEM // WEB DEV</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="crt">
    <header>
      <h1 class="huge">ARTEM</h1>
      <h1 class="huge" style="margin-top:3px;">KULACHEK</h1>
      <p>FULLSTACK DEV / DESIGN</p>
    </header> 
  </div>`,

    CSS: `.skill-list{
  list-style:none;
  margin:0; padding:0;
  max-height:380px;        
  overflow-y:auto;
  padding: 10px;
}
.skill-list li{
  display:flex; 
  justify-content:space-between;
  padding: 6px 20px 6px 20px;
  font-size: 1.7rem;
}
.row-info{
  display:grid;
  grid-template-columns:30% 70%;
  row-gap:2px;
  font-size: 1.2rem;
  padding: 10px 20px 10px 20px;
}`,

    'Bootstrap 5': `<form>
  <div class="mb-3">
    <label for="exampleInputEmail1" class="form-label">Email address</label>
    <input type="email" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp">
    <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
  </div>
  <div class="mb-3">
    <label for="exampleInputPassword1" class="form-label">Password</label>
    <input type="password" class="form-control" id="exampleInputPassword1">
  </div>
  <div class="mb-3 form-check">
    <input type="checkbox" class="form-check-input" id="exampleCheck1">
    <label class="form-check-label" for="exampleCheck1">Check me out</label>
  </div>
  <button type="submit" class="btn btn-primary">Submit</button>
</form>`,

  'JavaScript': `function tick(){
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul',
      'Aug','Sep','Oct','Nov','Dec'];
    const date = ///{d.getDate()}-///{months[d.getMonth()] 
      }-//{String(d.getFullYear()).slice(-2)};

    let h = d.getHours(), m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const time = ///{String(h).padStart(2,'0')}://
    // {String(m).padStart(2,'0')}///{ampm}//;

    document.getElementById('clock-date').textContent = date;
    document.getElementById('clock-time').textContent = time;
}
tick(); setInterval(tick, 1000);` ,

  Python: `@staticmethod
  def gen_sequence(
      conditions,
  ):  
      possible_characters = [
           str.ascii_lowercase,
           str.ascii_uppercase,
           str.digits,
           str.punctuation,
       ]
      sequence = ""
      for x in range(len(conditions)):
           if conditions[x]:
              sequence += possible_characters[x]
          else:
              pass
      return sequence

    @staticmethod
    def gen_password(sequence, passlength=8):
        password = "".join((secrets.choice(sequence) for i in range(passlength)))
        return password`,


  'SQL': `CREATE TABLE Person(
  Id int not null, 
  Name varchar not null, 
  DateOfBirth date not null, 
  Gender bit not null, 
  PRIMARY KEY(Id)
);
select Candidate, Office_Sought, Election_Year, FORMAT(sum(Total_$),2) from combined_party_data
  where Office_Sought = 'PRESIDENT / VICE PRESIDENT'
  group by Candidate, Office_Sought, Election_Year
  having Election_Year = 2016 and sum(Total_$) between 3000000 and 18000000
  order by sum(Total_$) desc;`,

  'Git/GitHub flow': `$ git fetch
remote: Counting objects: 3032, done.
remote: Compressing objects: 100% (947/947), done.
remote: Total 2672 (delta 1993), reused 2328 (delta 1689)
Receiving objects: 100% (2672/2672), 16.45 MiB | 1.04 MiB/s, done.
Resolving deltas: 100% (1993/1993), completed with 213 local objects.
From github.com:github/github
 * [new branch]      charlock-linguist       -> origin/charlock-linguist
 * [new branch]      enterprise-non-config   -> origin/enterprise-non-config
 * [new branch]      fi-signup               -> origin/fi-signup
   2647a42..4d6d2c2  git-http-server         -> origin/git-http-server
 * [new branch]      knyle-style-commits     -> origin/knyle-style-commits
   157d2b0..d33e00d  master                  -> origin/master
 * [new branch]      menu-behavior-act-i     -> origin/menu-behavior-act-i
   ea1c5e2..dfd315a  no-inline-js-config     -> origin/no-inline-js-config
 * [new branch]      svg-tests               -> origin/svg-tests
   87bb870..9da23f3  view-modes         gtfuh      -> origin/wild-renaming`,
   'Photoshop/Illustrator': `What are you waiting for?` ,

   'CSS/GSAP': `ScrollTrigger.create({
    trigger: '#id',
    start: 'top top',
    endTrigger: '#otherID',
    end: 'bottom 50%+=100px',
    onToggle: (self) => console.log('toggled, isActive:', self.isActive),
    onUpdate: (self) => {
        console.log(
            'progress:',
            self.progress.toFixed(3),
            'direction:',
            self.direction,
            'velocity',
            self.getVelocity()
        );
    }
});` ,
  'Linux&CLI': `ls - The most frequently used command in Linux to list directories
pwd - Print working directory command in Linux
cd - Linux command to navigate through directories
mkdir - Command used to create directories in Linux
mv - Move or rename files in Linux
cp - Similar usage as mv but for copying files in Linux
rm - Delete files or directories
touch - Create blank/empty files
ln - Create symbolic links (shortcuts) to other files
clear - Clear the terminal display
cat - Display file contents on the terminal
echo - Print any text that follows the command
less - Linux command to display paged outputs in the terminal
man - Access manual pages for all Linux commands
uname - Linux command to get basic information about the OS
whoami - Get the active username
tar - Command to extract and compress files in linux
grep - Search for a string within an output
head - Return the specified number of lines from the top
tail - Return the specified number of lines from the bottom
diff - Find the difference between two files
cmp - Allows you to check if two files are identical
comm - Combines the functionality of diff and cmp
sort - Linux command to sort the content of a file while outputting
export - Export environment variables in Linux
zip - Zip files in Linux
unzip - Unzip files in Linux
ssh - Secure Shell command in Linux
service - Linux command to start and stop services
ps - Display active processes
kill and killall - Kill active processes by process ID or name
df - Display disk filesystem information
mount - Mount file systems in Linux
chmod - Command to change file permissions
chown - Command for granting ownership of files or folders
ifconfig - Display network interfaces and IP addresses
traceroute - Trace all the network hops to reach the destination
wget - Direct download files from the internet
ufw - Firewall command
iptables - Base firewall for all other firewall utilities to interface with
apt, pacman, yum, rpm - Package managers depending on the distribution
sudo - Command to escalate privileges in Linux
cal - View a command-line calendar
alias - Create custom shortcuts for your regularly used commands
dd - Majorly used for creating bootable USB sticks
whereis - Locate the binary, source, and manual pages for a command
whatis - Find what a command is used for
top - View active processes live with their system usage
useradd and usermod - Add a new user or change existing user data
passwd - Create or update passwords for existing users`,
  'Node.js': `const http = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World!\///);
});

server.listen(port, hostname, () => {
  console.log(//Server running at http:///{hostname}:/{port}//);
}); `
  }; 