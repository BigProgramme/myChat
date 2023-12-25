import socket
import random
from threading import Thread
from datetime import datetime
from colorama import Fore, init, just_fix_windows_console

# init colors
init
just_fix_windows_console

# set the available colors
colors = [Fore.BLUE, Fore.CYAN, Fore.GREEN, Fore.LIGHTBLACK_EX, 
    Fore.LIGHTBLUE_EX, Fore.LIGHTCYAN_EX, Fore.LIGHTGREEN_EX, 
    Fore.LIGHTMAGENTA_EX, Fore.LIGHTRED_EX, Fore.LIGHTWHITE_EX, 
    Fore.LIGHTYELLOW_EX, Fore.MAGENTA, Fore.RED, Fore.WHITE, Fore.YELLOW
]

check_color_not_read = Fore.LIGHTGREEN_EX
check_color_read = Fore.LIGHTBLUE_EX

class Message():
  def __init__(self) -> None:
    self.my_id = 0
    self.status = 0
    self.user = ""
    self.date = ""
    self.msg = ""

class Interface():
  separator_token = ": " # we will use this to separate the client name & message
  states = {
    "sent": f"{check_color_not_read}v",
    "received": f"{check_color_not_read}vv",
    "read": f"{check_color_read}vv"
  }
  
  def __init__(self, myname):
    self.users = {}
    self.myname = myname
    self.messages = {}
    self.message_counter = 0
    #Clear 
    print("\033[1J")
    
  def move(self, x, y):
    print("\033[%d;%dH" % (y, x))
    
  def add_message(self, username, message):
    if username not in self.users:
      self.users[username] = random.choice(colors)
    date_now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if username == self.myname:
      print(f"{self.users[username]}[{date_now}] {username}{Interface.separator_token}{message}\t"+Interface.states["sent"]+f"{Fore.RESET}")
    else:
      print(f"{self.users[username]}[{date_now}] {username}{Interface.separator_token}{message}"+f"{Fore.RESET}")
    retc = self.message_counter
    self.messages[retc] = Message()
    self.messages[retc].my_id = retc
    self.messages[retc].status = "sent"
    self.messages[retc].user = username
    self.messages[retc].date = date_now
    self.messages[retc].msg = message
    self.message_counter+=1
    return retc
  
  def update_message(self, message_id, status):
    # print("\033[%dA" % (message_id))
    if message_id == self.message_counter - 1:
      print(f"\033[{self.message_counter-message_id}A{self.users[self.messages[message_id].user]}[{self.messages[message_id].date}] {self.messages[message_id].user}{Interface.separator_token}{self.messages[message_id].msg}\t"+Interface.states[status]+f"{Fore.RESET}")
    else:
      print(f"\033[{self.message_counter-message_id}A{self.users[self.messages[message_id].user]}[{self.messages[message_id].date}] {self.messages[message_id].user}{Interface.separator_token}{self.messages[message_id].msg}\t"+Interface.states[status]+f"{Fore.RESET}\033[{self.message_counter-message_id-1}B")
    # print("\033[%dB" % (message_id-1))

# cursor positioning
# ESC [ y;x H     # position cursor at x across, y down
# ESC [ y;x f     # position cursor at x across, y down
# ESC [ n A       # move cursor n lines up
# ESC [ n B       # move cursor n lines down
# ESC [ n C       # move cursor n characters forward
# ESC [ n D       # move cursor n characters backward

# clear the screen
# ESC [ mode J    # clear the screen