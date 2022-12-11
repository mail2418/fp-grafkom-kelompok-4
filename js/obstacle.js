function createObstacles() {
  for (let i = 0; i < 10; i++) {
    let obstacle = new Obstacle();
    obstaclesPool.push(obstacle);
  }
  obstaclesHolder = new ObstaclesHolder();
  // obstaclesHolder.mesh.position.y = -game.seaRadius;
  scene.add(obstaclesHolder.mesh);
}

function Obstacle() {
  // let geom = new THREE.TetrahedronGeometry(8,2);
  let geom = new THREE.CubeGeometry(12, 12, 12);
  let mat = new THREE.MeshPhongMaterial({
    color: colorList.brownDark,
    shininess: 0,
    specular: 0xffffff,
    shading: THREE.FlatShading,
  });
  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.castShadow = true;
  this.angle = 0;
  this.dist = 0;
}

function ObstaclesHolder() {
  this.mesh = new THREE.Object3D();
  this.obstaclesInUse = [];
}

ObstaclesHolder.prototype.spawnObstacles = function () {
  let nObstacles = game.level;

  for (let i = 0; i < nObstacles; i++) {
    let obstacle;
    if (obstaclesPool.length) {
      obstacle = obstaclesPool.pop();
    } else {
      obstacle = new Obstacle();
    }

    obstacle.angle = -(i * 0.1);
    obstacle.distance =
      game.waterRadius +
      game.planeDefaultHeight +
      (-1 + Math.random() * 2) * (game.planeAmpHeight - 20);
    obstacle.mesh.position.y = -game.waterRadius + Math.sin(obstacle.angle) * obstacle.distance;
    obstacle.mesh.position.x = Math.cos(obstacle.angle) * obstacle.distance;

    this.mesh.add(obstacle.mesh);
    this.obstaclesInUse.push(obstacle);
  }
};

ObstaclesHolder.prototype.rotateObstacles = function () {
  for (let i = 0; i < this.obstaclesInUse.length; i++) {
    let obstacle = this.obstaclesInUse[i];
    obstacle.angle += game.speed * deltaTime * game.obstaclesSpeed;

    if (obstacle.angle > Math.PI * 2) obstacle.angle -= Math.PI * 2;

    obstacle.mesh.position.y = -game.waterRadius + Math.sin(obstacle.angle) * obstacle.distance;
    obstacle.mesh.position.x = Math.cos(obstacle.angle) * obstacle.distance;
    obstacle.mesh.rotation.z += Math.random() * 0.1;
    obstacle.mesh.rotation.y += Math.random() * 0.1;

    //var globalObstaclePosition =  obstacle.mesh.localToWorld(new THREE.Vector3());
    var diffPos = airplane.rocketGroup.position.clone().sub(obstacle.mesh.position.clone());
    var d = diffPos.length();
    if (d<game.obstacleDistanceTolerance){
    //let globalObstaclePosition =  obstacle.mesh.localToWorld(new THREE.Vector3());
      // particlesHolder.spawnParticles(obstacle.mesh.position.clone(), 15, colorList.red, 3);

      obstaclesPool.unshift(this.obstaclesInUse.splice(i, 1)[0]);
      this.mesh.remove(obstacle.mesh);
      game.planeCollisionSpeedX = (100 * diffPos.x) / d;
      game.planeCollisionSpeedY = (100 * diffPos.y) / d;
      ambientLight.intensity = 2;

      removeEnergy();
      i--;
    } else if (obstacle.angle > Math.PI) {
      obstaclesPool.unshift(this.obstaclesInUse.splice(i, 1)[0]);
      this.mesh.remove(obstacle.mesh);
      i--;
    }
  }
};
