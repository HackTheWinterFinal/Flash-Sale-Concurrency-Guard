-- redis/seatLock.lua
if redis.call("EXISTS", KEYS[1]) == 0 then
  redis.call("SET", KEYS[1], ARGV[1], "PX", ARGV[2])
  return 1
end
return 0
